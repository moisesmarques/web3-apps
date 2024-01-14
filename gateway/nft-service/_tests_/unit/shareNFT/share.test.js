const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

const sinon = require('sinon');
const lambda = require('../../../share');
const utils = require('../../../utils');
const data = require('./mock/request');

describe('Test share-nft', () => {
  let getSpy;
  let putSpy;
  beforeAll(() => {
    // It is just the way to bypass the DynamoDB oprations during Test Case
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    // It is just the way to bypass the JWT oprations during Test Case
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    putSpy.mockRestore();
    sinon.restore();
  });

  it('should fail when token is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        nftId: data.nftId,
        recipientWalletId: data.recipientWalletId,
      },
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error detail NFT',
      data: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when token is invalid', async () => {
    sinon.restore();
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.fakejwtMock);
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        nftId: data.nftId,
        recipientWalletId: data.recipientWalletId,
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error detail NFT',
      data: "User does not have any wallet associated with it's identity",
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when nftId is missing', async () => {
    sinon.restore();
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        recipientWalletId: data.recipientWalletId,
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "nftId" is required.',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when recipientWalletId is missing', async () => {
    sinon.restore();
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "recipientWalletId" is required.',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when user is not owner of the NFT', async () => {
    sinon.restore();
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({
        Item: { nftId: data.nftId, ownerwalletId: data.recipientWalletId },
      }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        nftId: data.nftId,
        recipientWalletId: data.recipientWalletId,
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.FORBIDDEN, {
      message: 'Error detail NFT',
      data: 'You are not authorized to share this NFT.',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when InternalServerError', async () => {
    sinon.restore();
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
    getSpy.mockReturnValue({
      promise: () => Promise.reject({
        Item: { nftId: data.nftId, ownerwalletId: data.recipientId },
      }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        nftId: data.nftId,
        recipientWalletId: data.recipientWalletId,
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error detail NFT',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass with valid payload', async () => {
    sinon.restore();
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.nft }),
    });
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        nftId: data.nftId,
        recipientWalletId: data.recipientWalletId,
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'NFT Shared Successfully.',
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
    expect(result.message).toEqual(expectedResult.message);
  });
});
