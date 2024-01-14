/* eslint-disable no-unused-vars */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const S3 = require('aws-sdk/clients/s3');
const lambda = require('../../../lambda/deleteFile/index');
const utils = require('../../../utils');
const user = require('../../../user');
const data = require('./mock/request');
const file = require('../../../src/models/files');
const wallet = require('../../../src/models/wallets');

jest.mock('../../../src/models/wallets', () => {
  const originalModule = jest.requireActual('../../../src/models/wallets');

  return {
    ...originalModule,
    getWallet: jest.fn(),
  };
});

describe('Test delete File', () => {
  let getSpy;
  let updateSpy;
  let deleteSpy;
  let verifyAccessTokenSpy;
  let getFileSpy;
  let getWalletSpy;
  let deleteFileFromAllWalletsSpy;
  let deleteObjectSpy;
  // let putSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    // updateSpy = jest.spyOn(DocumentClient.prototype, 'update');
    updateSpy = jest.spyOn(DocumentClient.prototype, 'update');
    deleteSpy = jest.spyOn(DocumentClient.prototype, 'delete');
    getFileSpy = jest.spyOn(file, 'getFile');
    deleteFileFromAllWalletsSpy = jest.spyOn(file, 'deleteFileFromAllWallets');
    getWalletSpy = jest.spyOn(wallet, 'getWallet');
    verifyAccessTokenSpy = jest.spyOn(user, 'verifyUser');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    getWalletSpy.mockRestore();
  });

  it('should fail when fileId is missing', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    const event = {
      httpMethod: 'DELETE',
      pathParameters: { walletId: 'demo777.testnet' },
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
      httpMethod: 'DELETE',
      pathParameters: { walletId: 'demo777.testnet', fileId: '343sfss4243-fasef4354' },
      headers: { Authorization: '' },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when wallet not found', async () => {
    verifyAccessTokenSpy.mockReturnValueOnce({
      promise: () => Promise.resolve(data.jwtMock),
    });
    getWalletSpy.mockResolvedValueOnce(false);

    const event = {
      httpMethod: 'DELETE',
      pathParameters: { walletId: 'demo777.testnet', fileId: '452erwr-3424-dsfsf455-xvdfw5-sdsf45' },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Wallet not found',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when there is wallet mismatch', async () => {
    verifyAccessTokenSpy.mockResolvedValueOnce(data.jwtMock);

    getWalletSpy.mockResolvedValueOnce({
      test: 'test',
    });

    const event = {
      httpMethod: 'DELETE',
      pathParameters: {
        walletId: 'demo233.testnet',
        fileId: '452erwr-3424-dsfsf455-xvdfw5-sdsf45',
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
      data: {},
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when there is no file associated with wallet', async () => {
    verifyAccessTokenSpy.mockResolvedValueOnce(data.jwtMock);

    getWalletSpy.mockResolvedValueOnce({
      walletId: 'demo233.testnet',
      userId: data.jwtMock.userId,
    });

    getFileSpy.mockResolvedValueOnce(false);
    const event = {
      httpMethod: 'DELETE',
      pathParameters: {
        walletId: 'demo233.testnet',
        fileId: '452erwr-3424-dsfsf455-xvdfw5-sdsf45',
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `No file '${event.pathParameters.fileId}' associated with wallet '${event.pathParameters.walletId}'`,
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when there is no file associated with wallet is uploaded', async () => {
    verifyAccessTokenSpy.mockResolvedValueOnce(data.jwtMock);

    getWalletSpy.mockResolvedValueOnce({
      walletId: 'demo233.testnet',
      userId: data.jwtMock.userId,
    });

    getFileSpy.mockResolvedValueOnce({
      hash: false,
    });
    const event = {
      httpMethod: 'DELETE',
      pathParameters: {
        walletId: 'demo233.testnet',
        fileId: '452erwr-3424-dsfsf455-xvdfw5-sdsf45',
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `No file '${event.pathParameters.fileId}' associated with wallet '${event.pathParameters.walletId}' has been uploaded`,
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when user is not the owner', async () => {
    verifyAccessTokenSpy.mockResolvedValueOnce(data.jwtMock);

    getWalletSpy.mockResolvedValueOnce({
      walletId: 'demo233.testnet',
      userId: data.jwtMock.userId,
    });

    getFileSpy.mockResolvedValueOnce({
      hash: '02cl39W4iCQKaRWEISeSgJVCgdb6',
      walletId: 'otherWalletId',
      ownerId: 'otherOwnerId',
    });
    const event = {
      httpMethod: 'DELETE',
      pathParameters: {
        walletId: 'demo233.testnet',
        fileId: '452erwr-3424-dsfsf455-xvdfw5-sdsf45',
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authorized to perform this operation',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should success when correct value is provided', async () => {
    verifyAccessTokenSpy.mockResolvedValueOnce(data.jwtMock);

    getWalletSpy.mockResolvedValueOnce({
      walletId: 'demo233.testnet',
      userId: data.jwtMock.userId,
    });

    getFileSpy.mockResolvedValueOnce({
      hash: '02cl39W4iCQKaRWEISeSgJVCgdb6',
      walletId: 'demo233.testnet',
      ownerId: 'otherOwnerId',
    });

    deleteFileFromAllWalletsSpy.mockResolvedValueOnce(true);
    // deleteObjectSpy.mockReturnValueOnce({
    //   promise: () => Promise.resolve(true),
    // });
    const event = {
      httpMethod: 'DELETE',
      pathParameters: {
        walletId: 'demo233.testnet',
        fileId: '452erwr-3424-dsfsf455-xvdfw5-sdsf45',
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authorized to perform this operation',
    });

    expect(result).toEqual(expectedResult);
  });
});
