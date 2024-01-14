/* eslint-disable prefer-promise-reject-errors */
// @ts-nocheck
const {
  DocumentClient,
} = require('aws-sdk/clients/dynamodb');
const {
  StatusCodes,
} = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const lambda = require('../../../lambda/fetchFolderById/index');
const utils = require('../../../utils');
const user = require('../../../user');
const data = require('./mock/request.json');
const Wallets = require('../../../src/models/wallets');

jest.mock('../../../src/models/wallets', () => {
  const originalModule = jest.requireActual('../../../src/models/wallets');

  return {
    ...originalModule,
    getWallet: jest.fn(),
  };
});

describe('Test Fetch Folder By Id', () => {
  let verifyAccessTokenSpy;
  let getWalletSpy;
  let querySpy;
  beforeAll(() => {
    querySpy = jest.spyOn(DocumentClient.prototype, 'query');
    verifyAccessTokenSpy = jest.spyOn(user, 'verifyUser');
    getWalletSpy = jest.spyOn(Wallets, 'getWallet');
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock);
  });

  afterAll(() => {
    querySpy.mockRestore();
  });

  it('should fail when payload is invalid', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });
    const event = {
      pathParameters: {
        walletId: 'titusddd.testnet',
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'folderId missing in the request!',
    });
    expect(result).toEqual(expectedResult);
  });
  it('should fail when authorization token is invalid/missing/expired', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });
    const event = {
      pathParameters: {
        walletId: 'titusddd.testnet',
        folderId: '',
      },
      headers: {
        Authorization: '',
      },
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
      pathParameters: {
        walletId: 'titusddd.testnet',
        folderId: 'testFolder',
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
  it('should fail when there is wallet mismatch', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });

    getWalletSpy.mockResolvedValueOnce({
      walletId: 'otherWalletId.testnet',
      userId: 'otherUserId',
    });

    const event = {
      pathParameters: {
        walletId: 'titusddd.testnet',
        folderId: 'testFolder',
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
    });

    expect(result).toEqual(expectedResult);
  });
  it('should failed when folderId not match with walletid', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });
    getWalletSpy.mockResolvedValueOnce({
      walletId: 'titusddd.testnet',
      userId: data.jwtMock.userId,
    });
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });
    const event = {
      pathParameters: {
        walletId: 'titusddd.testnet',
        folderId: 'testFolder',
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'No folder \'testFolder\' associated with this wallet',
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
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({
        Item: data.folder,
      }),
    });
    const event = {
      pathParameters: {
        walletId: 'titusddd.testnet',
        folderId: 'testFolder',
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = {
      created: 1648757247986,
      id: '101a60f3-3c88-460f-88eb-afece2c73299',
      name: 'mySampleFolder',
      ownerId: 'titusdemo.testnet',
      parentFolderId: 'root',
      pk: 'FOLDER#id=101a60f3-3c88-460f-88eb-afece2c73299',
      pk1: 'FOLDER#walletId=titusdemo.testnet#parentFolderId=root',
      size: 0,
      sk: 'walletId=titusdemo.testnet',
      sk1: 'id=101a60f3-3c88-460f-88eb-afece2c73299',
      status: 'active',
      updated: '2022-03-31T20: 07: 27.987Z',
      walletId: 'titusdemo.testnet',
    };
    expect(result).toEqual(expectedResult);
  });
  it('should fail with InternalServerError', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.reject({
        Item: undefined,
      }),
    });
    const event = {
      pathParameters: {
        walletId: 'titusddd.testnet',
        folderId: 'testFolder',
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);

    const expectedResult = utils.send(404 || StatusCodes.INTERNAL_SERVER_ERROR, { data: undefined, message: 'Wallet not found',});
    expect(result).toEqual(expectedResult);
  });
});
