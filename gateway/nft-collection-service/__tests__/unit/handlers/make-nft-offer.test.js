/* eslint-disable no-undef */

const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const lambda = require('../../../make-nft-offer');
const utils = require('../../../utils');
const mockResponse = require('./mock.json');

const { Authorization } = mockResponse;

describe('Test nft-collection-service make-nft-offer lambda', () => {
  let getSpy;
  let putSpy;
  const OLD_ENV = process.env;
  let jwtSpy;

  beforeAll(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    querySpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
    jwtSpy = jest.spyOn(jwt, 'verify');
    jwtSpy.mockReturnValue(mockResponse.user);
  });

  /** * Clean up mocks ** */
  afterAll(() => {
    putSpy.mockRestore();
    querySpy.mockRestore();
    getSpy.mockRestore();
    process.env = OLD_ENV;
  });

  it('should fail when required input does not provided as input', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      headers: {
        Authorization,
      },
      body: '{}',
    };

    const actualResult = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid or missing.',
      data: [
        '"offerType" is required',
        '"offerNftId" is required',
        '"expire" is required',
        '"userId" is required',
      ],
    });
    expect(actualResult).toEqual(expectedResult);
  });

  it('should fail when required nftId does not provided as input', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      headers: {
        Authorization,
      },
      body: '{"offerType": "TOKEN","offerNftId": "34343","expire": "1647515358818","userId": "12XCAAASHHAJ23JS"}',
    };

    const actualResult = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "nftId" is required.',
    });
    expect(actualResult).toEqual(expectedResult);
  });

  it('should fail when no data found respective to provided nftId', async () => {
    jwtSpy.mockReturnValue(mockResponse.newUser);
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [mockResponse.sharedNft] }),
    });

    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: '12XCAAASHHAJ23JS',
      },
      headers: {
        Authorization,
      },
      body: JSON.stringify(mockResponse.tokenOffer),
    };

    const actualResult = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'NFT not found by nftId: 12XCAAASHHAJ23JS !',
    });
    expect(actualResult).toEqual(expectedResult);
  });

  it('should pass with valid payload', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mockResponse.myNFT }),
    });
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mockResponse.myNFT }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: '12XCAAASHHAJ23JS',
      },
      headers: {
        Authorization,
      },
      body: JSON.stringify(mockResponse.tokenOffer),
    };

    const actualResult = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'The NFT offer has been initialized successfully.',
    });
    expect(actualResult.statusCode).toEqual(expectedResult.statusCode);
    expect(actualResult.message).toEqual(expectedResult.message);
  });

  it('should fail when InternalServerError', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.reject(new Error({ Item: undefined })),
    });
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mockResponse.myNFT }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: '12XCAAASHHAJ23JS',
      },
      headers: {
        Authorization,
      },
      body: JSON.stringify(mockResponse.tokenOffer),
    };

    const actualResult = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Internal server error',
    });
    expect(actualResult.statusCode).toEqual(expectedResult.statusCode);
    expect(actualResult.message).toEqual(expectedResult.message);
  });

  it('should pass when invalid nftId is found', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [mockResponse.sharedNft] }),
    });
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: { nftId: mockResponse.nftId },
      headers: { Authorization: mockResponse.Authorization },
      body: JSON.stringify(mockResponse.tokenOffer),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `NFT not found by nftId: ${mockResponse.nftId} !`,
    });
    expect(result).toEqual(expectedResult);
  });
});
