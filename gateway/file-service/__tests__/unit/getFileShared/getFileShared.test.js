// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const lambda = require('../../../lambda/getFilesShared/index');
const utils = require('../../../utils');
const user = require('../../../user');
const Wallet = require('../../../src/models/wallets');
const data = require('./mock/request');
const resData = require('./mock/response');
const Files = require('../../../src/models/files');

jest.mock('../../../src/models/wallets', () => {
  const originalModule = jest.requireActual('../../../src/models/wallets');

  return {
    ...originalModule,
    getWallet: jest.fn(),
  };
});

describe('Test getFileShared', () => {
  let getSpy;
  let getWallet;
  let getFileShared;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    getWallet = jest.spyOn(Wallet, 'getWallet');
    getFileShared = jest.spyOn(Files, 'getFilesShared');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should be fail when authorization token invalid/missing/expired', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { walletId: 'demo777.testnet' },
      headers: { Authorization: '', appid: 'QhC1zO9ko2yCUu3VqRf4O' },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should be fail when there is no walletId found', async () => {
    getWallet.mockReturnValueOnce(undefined);

    const event = {
      httpMethod: 'GET',
      pathParameters: { walletId: 'demo233.testnet' },
      headers: {
        appid: 'QhC1zO9ko2yCUu3VqRf4O',
        Authorization: data.AuthCode,
      },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Wallet not found',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should be fail when there is wallet mismatch', async () => {
    getWallet.mockReturnValueOnce({ walletName: data.jwtMock.walletName });

    const event = {
      httpMethod: 'GET',
      pathParameters: { walletId: 'demo233.testnet' },
      headers: {
        appid: 'QhC1zO9ko2yCUu3VqRf4O',
        Authorization: data.AuthCode,
      },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
      data: {},
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should succeed when request is valid', async () => {
    getWallet.mockReturnValueOnce({
      walletId: 'titusddd.testnet',
      userId: data.jwtMock.userId,
    });

    getFileShared.mockResolvedValueOnce(resData.response);

    const event = {
      httpMethod: 'GET',
      pathParameters: { walletId: 'titusddd.testnet' },
      headers: { Authorization: data.AuthCode, appid: 'QhC1zO9ko2yCUu3VqRf4O' },
    };
    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.OK, resData.response);
    expect(result).toEqual(expectedResult);
  });
});
