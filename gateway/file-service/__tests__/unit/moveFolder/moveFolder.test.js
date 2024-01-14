// @ts-nocheck
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const user = require('../../../user');
const lambda = require('../../../lambda/moveFolderStorage/index');
const utils = require('../../../utils');
const data = require('./mock/request.json');
const wallets = require('../../../src/models/wallets');
const Folders = require('../../../src/models/folders');

jest.mock('../../../src/models/wallets', () => {
  const originalModule = jest.requireActual('../../../src/models/wallets');

  return {
    ...originalModule,
    getWallet: jest.fn(),
  };
});

describe('Test move-folder', () => {
  let getSpy;
  let verifyAccessTokenSpy;
  let getWalletSpy;
  let getFolderByIdSpy;
  let upsertFolderSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    verifyAccessTokenSpy = jest.spyOn(user, 'verifyUser');
    getWalletSpy = jest.spyOn(wallets, 'getWallet');
    getFolderByIdSpy = jest.spyOn(Folders, 'getFolderById');
    upsertFolderSpy = jest.spyOn(Folders, 'upsertFolder');
    // eslint-disable-next-line no-unused-vars
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    getFolderByIdSpy.mockRestore();
    upsertFolderSpy.mockRestore();
    getWalletSpy.mockRestore();
    sinon.restore();
  });

  it('should fail when folderId is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'titusddd.testnet' },
      queryStringParameters: {
        parentFolderId: 'parentFolderId',
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'folderId missing in the request!',
    });
    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
    // expect to throw error
    // expect(() => lambda.handler(event)).toThrow();
  });

  it('should fail when parentFolderId is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'titusddd.testnet', folderId: 'folderId' },
      queryStringParameters: {

      },
      body: undefined,
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'parentFolderId missing in the request!',
    });
    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
    // expect to throw error
    // expect(() => lambda.handler(event)).toThrow();
  });

  it('should fail when authorization token is invalid/missing/expired', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        walletId: 'titusddd.testnet',
        folderId: 'folderId',
      },
      queryStringParameters: {
        parentFolderId: 'parentFolderId',
      },
      body: JSON.stringify(data.payload),
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

  it('should fail when user mismatch with stored wallet', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        walletId: 'titusddd.testnet',
        folderId: 'folderId',
      },
      queryStringParameters: {
        parentFolderId: 'parentFolderId',
      },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };
    getWalletSpy.mockResolvedValueOnce({
      userId: 'otherUserId',
    });
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no folder associated with the wallet', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        walletId: 'titusWallet.near',
        folderId: 'folderId',
      },
      queryStringParameters: {
        parentFolderId: 'parentFolderId',
      },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };
    getWalletSpy.mockResolvedValueOnce({
      userId: data.jwtMock.userId,
      walletId: data.jwtMock.walletName,
    });

    getFolderByIdSpy.mockResolvedValueOnce(undefined);

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `No folder '${event.pathParameters.folderId}' associated with this wallet`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when folder is not owned by user', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        walletId: 'titusWallet.near',
        folderId: 'folderId',
      },
      queryStringParameters: {
        parentFolderId: 'parentFolderId',
      },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };
    verifyAccessTokenSpy.mockReturnValueOnce({
      promise: () => Promise.resolve(data.jwtMock),
    });
    getWalletSpy.mockResolvedValueOnce({
      userId: data.jwtMock.userId,
      walletId: data.jwtMock.walletName,
    });

    getFolderByIdSpy.mockResolvedValueOnce({ Item: true });

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authorized to perform this operation',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should success with proper values', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        walletId: 'titusWallet.near',
        folderId: 'folderId',
      },
      queryStringParameters: {
        parentFolderId: 'parentFolderId',
      },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };
    getWalletSpy.mockResolvedValueOnce({
      userId: '_BE_Ou5exXqW-wFLuTxud',
      walletId: 'titusWallet.near',
    });
    getFolderByIdSpy.mockResolvedValueOnce({
      Item: {
        ownerId: 'titusWallet.near',
      },
    });
    upsertFolderSpy.mockResolvedValueOnce({
      moved: true,
    });
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      moved: true,
    });
    expect(result).toEqual(expectedResult);
  });
});
