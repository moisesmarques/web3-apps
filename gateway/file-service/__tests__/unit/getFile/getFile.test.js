/* eslint-disable no-undef */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const S3 = require('aws-sdk/clients/s3');
const lambda = require('../../../lambda/getFile/index');
const utils = require('../../../utils');
const data = require('./mock/request.json');
const Wallets = require('../../../src/models/wallets');
const Files = require('../../../src/models/files');

jest.mock('../../../src/models/wallets', () => {
  const originalModule = jest.requireActual('../../../src/models/wallets');

  return {
    ...originalModule,
    getWallet: jest.fn(),
  };
});

describe('Test get-file', () => {
  let getSpy;
  let getWalletSpy;
  let getFileSpy;
  let getSignedUrlPromiseSpy;
  const OLD_ENV = process.env;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    getWalletSpy = jest.spyOn(Wallets, 'getWallet');
    getFileSpy = jest.spyOn(Files, 'getFile');
    getSignedUrlPromiseSpy = jest.spyOn(S3.prototype, 'getSignedUrlPromise');
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    sinon.restore();
  });

  it('should fail when fileId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'fileId missing in the request!',
    });
    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when walletId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'walletId missing in the request!',
    });
    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when walletId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { fileId: 'fileId' },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'walletId missing in the request!',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when auth is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.payload.walletId,
      },
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId is not exist', async () => {
    process.env.TABLE_NAME_WALLETS = 'TABLE_NAME_WALLETS';
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [] }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.wrongpayload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Wallet not found',
    });
    expect(result).toEqual(expectedResult);
  });
  it('should fail when user mismatch with stored wallet', async () => {
    process.env.TABLE_NAME_WALLETS = 'TABLE_NAME_WALLETS';
    getWalletSpy.mockResolvedValueOnce({
      test: 'test',
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.wrongpayload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Wallet associated with user mismatch with stored wallet',
    });
    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });
  it('should fail when no file associated with wallet', async () => {
    process.env.TABLE_NAME_WALLETS = 'TABLE_NAME_WALLETS';
    getWalletSpy.mockResolvedValueOnce({ walletId: data.payload.walletId });
    getFileSpy.mockResolvedValueOnce(false);
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `No file '${data.payload.fileId}' associated with this wallet`,
    });
    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });
  it('should fail when no file is not owned by user', async () => {
    process.env.TABLE_NAME_WALLETS = 'TABLE_NAME_WALLETS';
    getWalletSpy.mockResolvedValueOnce({ walletId: data.payload.walletId });
    getFileSpy.mockResolvedValueOnce({
      ownerId: 'otherUser',
      walletId: 'otherWallet.near',
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'You are not authorized to perform this operation',
    });
    expect(JSON.parse(result.body).message).toBe(JSON.parse(expectedResult.body).message);
  });
  it('should fail when user has not accepted file share before accessing this file ', async () => {
    process.env.TABLE_NAME_WALLETS = 'TABLE_NAME_WALLETS';
    getWalletSpy.mockResolvedValueOnce({ walletId: data.payload.walletId });
    getFileSpy.mockResolvedValueOnce({
      ownerId: 'otherUser',
      walletId: data.payload.walletId,
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'You must accept file share before accessing this file',
    });
    expect(JSON.parse(result.body).message).toBe(JSON.parse(expectedResult.body).message);
  });
  it('should success when proper fileId and walletId is provided', async () => {
    process.env.TABLE_NAME_WALLETS = 'TABLE_NAME_WALLETS';
    getWalletSpy.mockResolvedValueOnce({ walletId: data.payload.walletId });
    getFileSpy.mockResolvedValueOnce({
      ownerId: 'otherUser',
      walletId: data.payload.walletId,
      acceptedAt: 123456789,
    });
    getSignedUrlPromiseSpy.mockResolvedValueOnce('signedUrl');
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    expect(result).toStrictEqual(data.successResponse);
  });
});
