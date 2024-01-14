/* eslint-disable no-undef,import/no-unresolved,no-unused-vars */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const S3 = require('aws-sdk/clients/s3');
const cfsign = require('aws-cloudfront-sign');
const lambda = require('../../../lambda/createFileStorage/index');
const utils = require('../../../utils');
const user = require('../../../user');
const Wallet = require('../../../src/models/wallets');
const data = require('./mock/request');
const resData = require('./mock/response');
const Folders = require('../../../src/models/folders');
const Files = require('../../../src/models/files');
const sm = require('../../../src/lib/sm');

jest.mock('../../../src/lib/sm', () => {
  const originalModule = jest.requireActual('../../../src/lib/sm');

  return {
    ...originalModule,
    getSecret: jest.fn(),
  };
});

describe('Test createFileStorage', () => {
  let getSpy;
  let verifyAccessTokenSpy;
  let updateSpy;
  let getWallet;
  let getFolderById;
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
    getFolderById = jest.spyOn(Folders, 'getFolderById');
    getSignedUrlPromiseSpy = jest.spyOn(S3.prototype, 'getSignedUrlPromise');
    getSecretSpy = jest.spyOn(sm, 'getSecret');
    getSignedUrlSpy = jest.spyOn(cfsign, 'getSignedUrl');
    upsertFileSpy = jest.spyOn(Files, 'upsertFile');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should fail when payload is invalid', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'demo777.testnet' },
      body: undefined,
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Invalid JSON Body',
      data: {},
    });
    expect(result).toEqual(expectedResult);
  });

  it('should be fail when authorization token is invalid/missing/expired', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'demo777.testnet' },
      body: JSON.stringify(data.payload),
      headers: { Authorization: '' },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when there is no walletId found', async () => {
    verifyAccessTokenSpy.mockReturnValueOnce({
      promise: () => Promise.resolve(data.jwtMock),
    });
    getWallet.mockImplementationOnce(async () => null);

    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'demo233.testnet' },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Wallet not found',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when there is wallet mismatch', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });
    getWallet.mockResolvedValueOnce(data.wrongPayload.walletId);

    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'demo233.testnet' },
      body: JSON.stringify(data.payload),
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

    getFolderById.mockResolvedValueOnce({
      Item: false,
    });

    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: data.jwtMock.walletName },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: `Folder Id '${data.payload.folderId}' not found`,
      data: {},
    });

    expect(JSON.parse(result.body).message).toBe(JSON.parse(expectedResult.body).message);
  });

  it('should succeed when request is valid', async () => {
    // upsertFileSpy.mockReturnValue();

    getWallet.mockResolvedValueOnce({
      userId: data.jwtMock.userId,
      walletId: data.jwtMock.walletName,
    });

    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    getFolderById.mockResolvedValueOnce({
      Items: [],
    });
    getSignedUrlPromiseSpy.mockResolvedValueOnce('https://s3.amazonaws.com/test.com/test.jpg');
    getSecretSpy.mockResolvedValueOnce(JSON.stringify({
      PUBLIC_KEY_ID: 'PUBLIC_KEY_ID',
      PRIVATE_KEY: 'PRIVATE_KEY',
    }));
    getSignedUrlSpy.mockResolvedValueOnce('https://s3.amazonaws.com/test.com/test.jpg');
    upsertFileSpy.mockResolvedValueOnce({
      ttl: '1d',
      url: 'https://s3.amazonaws.com/test.com/test.jpg',
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve(resData.response),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'demo777.testnet' },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK);
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should fail when InternalServerError', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.reject({ Item: undefined }),
    });

    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'demo777.testnet' },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    console.log(result);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {});
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });
});
