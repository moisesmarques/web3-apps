/* eslint-disable prefer-promise-reject-errors */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const lambda = require('../../../lambda/createFolder/index');
const utils = require('../../../utils');
const user = require('../../../user');
const folder = require('../../../src/models/folders');
const data = require('./mock/request.json');

describe('Test create-folder', () => {
  let getSpy;
  let verifyAccessTokenSpy;
  let upsertFolderSpy;
  let querySpy;
  beforeAll(() => {
    jest.resetModules();
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    querySpy = jest.spyOn(DocumentClient.prototype, 'query');
    upsertFolderSpy = jest.spyOn(folder, 'upsertFolder');
    verifyAccessTokenSpy = jest.spyOn(user, 'verifyUser');
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
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Invalid JSON Body',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when folder name is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'titusddd.testnet' },
      body: JSON.stringify(data.emptyPayload),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid or missing.',
      data: ['Folder name is required'],
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

  it('should fail when there is wallet mismatch', async () => {
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
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
      data: {},
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when parentFolderId is invalid', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({
        Items: [],
      }),
    });

    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'titusWallet.near' },
      body: JSON.stringify(data.payloadWithInvalidParent),
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `No parent folder '${data.payloadWithInvalidParent.parentFolderId}' associated with this wallet`,
      data: {},
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when Internal server Error', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.reject({ Item: undefined }),
    });

    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'titusWallet.near' },
      body: JSON.stringify(data.payloadWithInvalidParent),
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {});

    expect(result).toEqual(expectedResult);
  });

  it('should succeed when request is valid', async () => {
    upsertFolderSpy.mockReturnValue(data.folder);
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({
        Items: data.folder,
      }),
    });

    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'titusWallet.near' },
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = {
      message: 'Folder created successfully',
      data: data.folder,
    };
    expect(result).toEqual(expectedResult);
  });

  it('should succeed when request is valid and have valid parentFolderId', async () => {
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [data.folder] }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [] }),
    });
    upsertFolderSpy.mockReturnValue(data.folder);

    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'titusWallet.near' },
      body: JSON.stringify(data.payloadWithValidParent),
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    // console.log(result.data);
    const expectedResult = {
      message: 'Folder created successfully',
      data: data.folder,
    };
    expect(result).toEqual(expectedResult);
  });
});
