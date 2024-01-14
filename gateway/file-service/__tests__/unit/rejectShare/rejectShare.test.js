/* eslint-disable no-undef,no-unused-vars */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const S3 = require('aws-sdk/clients/s3');
const lambda = require('../../../lambda/rejectShare/index');
const utils = require('../../../utils');
const data = require('./mock/request.json');
const Files = require('../../../src/models/files');
const Wallet = require('../../../src/models/wallets');
const user = require('../../../user');

jest.mock('../../../src/models/wallets', () => {
  const originalModule = jest.requireActual('../../../src/models/wallets');

  return {
    ...originalModule,
    getWallet: jest.fn(),
  };
});

describe('Test reject Share', () => {
  let getSpy;
  let getWallet;
  let getFileSpy;
  let getDeleteFileSpy;
  let verifyAccessTokenSpy;
  let getSignedUrlPromiseSpy;
  const OLD_ENV = process.env;

  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    getWallet = jest.spyOn(Wallet, 'getWallet');
    verifyAccessTokenSpy = jest.spyOn(user, 'verifyUser');
    getFileSpy = jest.spyOn(Files, 'getFile');
    getDeleteFileSpy = jest.spyOn(Files, 'deleteFile');
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    sinon.restore();
  });

  it('should fail when receiverId is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      body: JSON.stringify({}),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'receiverId missing in the request!',
    });
    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when auth is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.wrongpayload.walletId,
      },
      body: JSON.stringify(data.payload),
      headers: { Authorization: '' },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId is not exist', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [] }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.wrongpayload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify(data.payload),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Wallet not found',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when user mismatch with stored wallet', async () => {
    getWallet.mockResolvedValueOnce({
      walletId: 'otherWalletId.testnet',
      userId: 'otherUserId',
    });
    getFileSpy.mockResolvedValueOnce({
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.jwtMock.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify(data.payload),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no file shared with receiver', async () => {
    getWallet.mockResolvedValueOnce({
      walletId: data.jwtMock.walletId,
      userId: data.jwtMock.userId,
    });
    getFileSpy.mockResolvedValueOnce(undefined);
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.jwtMock.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify(data.payload),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Receiver file does not share this file',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass with valid payload', async () => {
    getWallet.mockResolvedValueOnce({
      walletId: data.jwtMock.walletId,
      userId: data.jwtMock.userId,
    });
    getFileSpy.mockResolvedValueOnce({});
    getDeleteFileSpy.mockResolvedValueOnce({});
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.jwtMock.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify(data.payload),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.ACCEPTED, undefined);
    expect(result).toEqual(expectedResult);
  });
});
