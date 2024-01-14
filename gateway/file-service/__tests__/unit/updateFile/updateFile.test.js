/* eslint-disable no-undef,no-unused-vars */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const lambda = require('../../../lambda/updateFile/index');
const utils = require('../../../utils');
const user = require('../../../user');
const data = require('./mock/request');
const responseData = require('./mock/response');
const file = require('../../../src/models/files');
const wallet = require('../../../src/models/wallets');

jest.mock('../../../src/models/wallets', () => {
  const originalModule = jest.requireActual('../../../src/models/wallets');

  return {
    ...originalModule,
    getWallet: jest.fn(),
  };
});

describe('Test update File', () => {
  let getSpy;
  let updateSpy;
  let verifyAccessTokenSpy;
  let getFileSpy;
  let getWalletSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    updateSpy = jest.spyOn(DocumentClient.prototype, 'update');
    getFileSpy = jest.spyOn(file, 'getFile');
    getWalletSpy = jest.spyOn(wallet, 'getWallet');
    verifyAccessTokenSpy = jest.spyOn(user, 'verifyUser');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    updateSpy.mockRestore();
  });

  it('should fail when fileId is missing', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    const event = {
      httpMethod: 'PUT',
      pathParameters: { walletId: 'demo777.testnet' },
      body: JSON.stringify(data.wrongFileId),
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'fileId missing in the request!',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should be fail when authorization token is invalid/missing/expired', async () => {
    const event = {
      httpMethod: 'PUT',
      pathParameters: { walletId: 'demo777.testnet', fileId: '343sfss4243-fasef4354' },
      body: JSON.stringify(data.payload),
      headers: { Authorization: '' },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when there is no walletId found', async () => {
    getWalletSpy.mockResolvedValueOnce(false);

    const event = {
      httpMethod: 'PUT',
      pathParameters: { walletId: 'demo233.testnet', fileId: '343sfss4243-fasef4354' },
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
    getWalletSpy.mockResolvedValueOnce({
      userId: 'otherUser',
      walletId: 'demo777.testnet',
    });

    const event = {
      httpMethod: 'PUT',
      pathParameters: { walletId: 'demo233.testnet', fileId: '343sfss4243-fasef4354' },
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
  it('should fail when file not found', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });
    getFileSpy.mockResolvedValueOnce(false);

    getWalletSpy.mockResolvedValueOnce({
      userId: data.jwtMock.userId,
      walletId: 'demo233.testnet',
    });
    const event = {
      httpMethod: 'PUT',
      pathParameters: { walletId: 'demo233.testnet', fileId: '343sfss4243-fasef4354' },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `No file '${event.pathParameters.fileId}' associated with this wallet`,
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should succeed when request is valid', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve(
        { Attributes: responseData.response },
      ),
    });
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });
    getFileSpy.mockResolvedValueOnce({
      name: 'test.txt',
    });

    getWalletSpy.mockResolvedValueOnce({
      userId: data.jwtMock.userId,
      walletId: 'demo233.testnet',
    });

    const event = {
      httpMethod: 'PUT',
      pathParameters: { walletId: 'demo233.testnet', fileId: '452erwr-3424-dsfsf455-xvdfw5-sdsf45' },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      ...responseData.response,
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });
});
