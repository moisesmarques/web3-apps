/* eslint-disable no-undef,import/no-unresolved,no-unused-vars */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const S3 = require('aws-sdk/clients/s3');
const cfsign = require('aws-cloudfront-sign');
const lambda = require('../../../lambda/getFileStorage/index');
const utils = require('../../../utils');
const user = require('../../../user');
const Wallet = require('../../../src/models/wallets');
const data = require('./mock/request');
const resData = require('./mock/response');
const Files = require('../../../src/models/files');
const sm = require('../../../src/lib/sm');

jest.mock('../../../src/lib/sm', () => {
  const originalModule = jest.requireActual('../../../src/lib/sm');

  return {
    ...originalModule,
    getSecret: jest.fn(),
  };
});

describe('Test GetFileStorage', () => {
  let getSpy;
  let verifyAccessTokenSpy;
  let updateSpy;
  let getWallet;
  let getFile;
  let getSignedUrlPromiseSpy;
  let getSecretSpy;
  let getSignedUrlSpy;
  let upsertFileSpy;
  // let putSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    updateSpy = jest.spyOn(DocumentClient.prototype, 'update');
    verifyAccessTokenSpy = jest.spyOn(user, 'verifyUser');
    getWallet = jest.spyOn(Wallet, 'getWallet');
    getFile = jest.spyOn(Files, 'getFile');
    getSignedUrlPromiseSpy = jest.spyOn(S3.prototype, 'getSignedUrlPromise');
    getSecretSpy = jest.spyOn(sm, 'getSecret');
    getSignedUrlSpy = jest.spyOn(cfsign, 'getSignedUrl');
    upsertFileSpy = jest.spyOn(Files, 'upsertFile');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should fail when fileId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { fileId: '', walletId: 'demo777.testnet' },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'fileId missing in the request!',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should be fail when authorization token invalid/missing/expired', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { walletId: 'demo777.testnet', fileId: 'e27fbbec-cb20-4d03-a0b4-b662a2821d26' },
      headers: { Authorization: '' },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should be fail when there is no walletId found', async () => {
    verifyAccessTokenSpy.mockReturnValueOnce({
      promise: () => Promise.resolve(data.jwtMock),
    });
    getWallet.mockImplementationOnce(async () => null);

    const event = {
      httpMethod: 'GET',
      pathParameters: { walletId: 'demo233.testnet', fileId: 'e27fbbec-cb20-4d03-a0b4-b662a2821d26' },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Wallet not found',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });
  it('should be fail when there is wallet mismatch', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });
    getWallet.mockResolvedValueOnce(data.walletId.walletId);

    const event = {
      httpMethod: 'GET',
      pathParameters: { walletId: 'demo233.testnet', fileId: 'e27fbbec-cb20-4d03-a0b4-b662a2821d26' },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
      data: {},
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when FileId is invalid', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });
    getWallet.mockResolvedValueOnce({
      userId: data.jwtMock.userId,
      walletId: data.jwtMock.walletName,
    });

    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    getFile.mockResolvedValueOnce({
      fileId: data.fileId.fileId,
      walletId: data.walletId.walletId,
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: { walletId: data.jwtMock.walletName, fileId: data.fileId.fileId },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'You are not authorized to perform this operation',
    });

    expect(JSON.parse(result.body).message).toBe(JSON.parse(expectedResult.body).message);
  });
  it('should fail when File is not accepted', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });
    getWallet.mockResolvedValueOnce({
      userId: data.jwtMock.userId,
      walletId: data.jwtMock.walletName,
    });

    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    getFile.mockResolvedValueOnce({
      fileId: data.fileId.fileId,
      walletId: data.jwtMock.walletName,
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: { walletId: data.jwtMock.walletName, fileId: data.fileId.fileId },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You must accept file share before accessing this file',
    });

    expect(JSON.parse(result.body).message).toBe(JSON.parse(expectedResult.body).message);
  });

  it('should succeed when request is valid', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    getWallet.mockResolvedValueOnce({
      walletId: data.jwtMock.walletName,
    });

    getFile.mockResolvedValueOnce({
      fileId: data.fileId.fileId,
      walletId: data.jwtMock.walletName,
      acceptedAt: true,
      ownerId: 'jPGd_Wg8FfVVKsdBu5332',
    });


    getSecretSpy.mockResolvedValueOnce(JSON.stringify({
      PUBLIC_KEY_ID: 'PUBLIC_KEY_ID',
      PRIVATE_KEY: 'PRIVATE_KEY',
    }));

    getSignedUrlSpy.mockResolvedValueOnce('https://s3.amazonaws.com/test.com/test.jpg');

    const event = {
      httpMethod: 'GET',
      pathParameters: { walletId: 'demo777.testnet', fileId: 'e27fbbec-cb20-4d03-a0b4-b662a2821d26' },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.OK, resData.response);
    expect(result).toEqual(expectedResult);
  });
});
