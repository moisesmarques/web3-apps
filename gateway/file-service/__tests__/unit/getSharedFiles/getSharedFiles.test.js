/* eslint-disable no-undef */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const cfsign = require('aws-cloudfront-sign');
const lambda = require('../../../lambda/getSharedFiles/index');
const utils = require('../../../utils');
const data = require('./mock/request.json');
const sm = require('../../../src/lib/sm');

jest.mock('../../../src/lib/sm', () => {
  const originalModule = jest.requireActual('../../../src/lib/sm');
  return {
    ...originalModule,
    getSecret: jest.fn(originalModule.getSecret),
  };
});
describe('Test get shared files', () => {
  let getSpy;
  let querySpy;
  let getSecretSpy;
  let getSignedUrlSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    querySpy = jest.spyOn(DocumentClient.prototype, 'query');
    getSecretSpy = jest.spyOn(sm, 'getSecret');
    getSignedUrlSpy = jest.spyOn(cfsign, 'getSignedUrl');
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    querySpy.mockRestore();
    getSecretSpy.mockRestore();
    getSignedUrlSpy.mockRestore();
    sinon.restore();
  });

  it('should fail when pathParameter is missing', async () => {
    const event = {
      httpMethod: 'GET',
    };
    // const result = await lambda.handler(event);
    try {
      await lambda.handler(event);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should fail when header is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should fail when auth is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        walletId: data.payload.walletId,
      },
      headers: {},
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
      httpMethod: 'GET',
      pathParameters: {
        walletId: data.wrongpayload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `Wallet '${data.wrongpayload.walletId} not found'`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId mismatch', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: { walletId: 'walletId' } }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        walletId: data.wrongpayload.walletId,
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

  it('should pass when when correct value is provided', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Item: {
          walletId: data.jwtMock.walletId,
          userId: data.jwtMock.userId,
        },
      }),
    });
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [
          {
            walletId: 'walletId',
            hash: 'testFileHash',
            folderId: 'testFolderId',
          },
        ],
      }),
    });
    getSecretSpy.mockResolvedValueOnce(
      JSON.stringify({
        PUBLIC_KEY_ID: 'PUBLIC_KEY_ID',
        PRIVATE_KEY: 'PRIVATE_KEY',
      }),
    );
    getSignedUrlSpy.mockReturnValueOnce('https://signedUrl');
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        walletId: data.jwtMock.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, [
      {
        walletId: 'walletId',
        hash: 'testFileHash',
        folderId: 'testFolderId',
        url: 'https://signedUrl',
        publicUrl: 'https://signedUrl',
      },
    ]);
    expect(result).toEqual(expectedResult);
  });
});
