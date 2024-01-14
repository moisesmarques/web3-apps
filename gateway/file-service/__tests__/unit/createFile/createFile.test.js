/* eslint-disable prefer-promise-reject-errors */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const S3 = require('aws-sdk/clients/s3');
const lambda = require('../../../lambda/createFile/index');
const utils = require('../../../utils');
const user = require('../../../user');
const data = require('./mock/request.json');
const Wallets = require('../../../src/models/wallets');
const file = require('../../../src/models/files');

jest.mock('../../../src/models/wallets', () => {
  const originalModule = jest.requireActual('../../../src/models/wallets');

  return {
    ...originalModule,
    getWallet: jest.fn(),
  };
});

describe('Test create-file', () => {
  let getSpy;
  let verifyAccessTokenSpy;
  let getWalletSpy;
  let getSignedUrlPromiseSpy;
  let upsertFileSpy;
  let querySpy;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    querySpy = jest.spyOn(DocumentClient.prototype, 'query');
    verifyAccessTokenSpy = jest.spyOn(user, 'verifyUser');
    getWalletSpy = jest.spyOn(Wallets, 'getWallet');
    getSignedUrlPromiseSpy = jest.spyOn(S3.prototype, 'getSignedUrlPromise');
    upsertFileSpy = jest.spyOn(file, 'upsertFile');
    // eslint-disable-next-line no-unused-vars
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    querySpy.mockRestore();
  });

  it('should fail when payload is invalid', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'titusddd.testnet' },
      body: undefined,
      headers: {
        appid: 'test',
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Invalid JSON Body',
      data: {},
    });
    expect(result).toEqual(expectedResult);
  });
  it('should fail when authorization token is invalid/missing/expired', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'titusddd.testnet' },
      body: JSON.stringify(data.payload),
      headers: { Authorization: '' },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });
  it('should fail when wallet not found', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });

    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'titusddd.testnet' },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Wallet not found',
    });

    expect(result).toEqual(expectedResult);
  });
  it('should fail when there is wallet mismatch', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });

    getWalletSpy.mockResolvedValueOnce({
      walletId: 'otherWalletId.testnet',
      userId: 'otherUserId',
    });

    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'titusddd.testnet' },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
    });

    expect(result).toEqual(expectedResult);
  });
  it('should success when correct value is provided', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });

    getWalletSpy.mockResolvedValueOnce({
      walletId: 'titusddd.testnet',
      userId: data.jwtMock.userId,
    });
    getSignedUrlPromiseSpy.mockResolvedValueOnce('signedUrl');
    upsertFileSpy.mockResolvedValueOnce({});
    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'titusddd.testnet' },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      url: 'signedUrl',
    });

    expect(result).toEqual(expectedResult);
  });
});
