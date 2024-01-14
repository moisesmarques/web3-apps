/* eslint-disable no-undef */

const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const lambda = require('../../../price-limit');
const utils = require('../../../utils');
const nft = require('../../../lib/model/nft');
const nftOffer = require('../../../lib/model/nft-offer');
const mockResponse = require('./mock.json');

const Authorization = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMlhDQUFBU0hIQUoyM0pTIiwiTmFtZSI6InRlc3QgdXNlciJ9.ULLSU4UFYWTLmc5-RHNECk1vWyq_LHs6CVMsL_rMMAg';

describe('Test iiii nft-collection-service price-limit lambda', () => {
  let getSpy;
  const OLD_ENV = process.env;
  let jwtSpy; let getNftByIdSpy; let
    createOfferIdSpy;

  beforeAll(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
    jwtSpy = jest.spyOn(jwt, 'verify');
    jwtSpy.mockReturnValue(mockResponse.nftPriceAndOffer[1]);
    getNftByIdSpy = jest.spyOn(nft, 'getNftById');
    getNftByIdSpy.mockReturnValue(
      {
        promise: () => Promise.resolve({
          Item: {
            userId: 'testUserId',
          },
        }),
      },
    );
    createOfferIdSpy = jest.spyOn(nftOffer, 'createOffer');
    createOfferIdSpy.mockReturnValue({
      message: 'The NFT offer has been initialized successfully.',
    });
  });

  afterEach(() => {
    jwtSpy.mockReturnValue(mockResponse.nftPriceAndOffer[0]);
  });

  /** * Clean up mocks ** */
  afterAll(() => {
    getSpy.mockRestore();
    updateSpy.mockRestore();
    process.env = OLD_ENV;
  });

  it('should fail when required nftId does not provided as input', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
      },
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
      message: 'The path parameter "nftId" is required.',
    });
    expect(actualResult).toEqual(expectedResult);
  });

  it('should fail when no data found respective to provided nftId', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: '12XCAAASHHAJ23JS',
      },
      headers: {
        Authorization,
      },
      body: '{"minPrice": 232}',
    };

    const actualResult = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'NFT not found by nftId: 12XCAAASHHAJ23JS !',
    });
    expect(actualResult).toEqual(expectedResult);
  });

  it('should fail when required input does not provided in request', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: '12XCAAASHHAJ23JS',
      },
      headers: {
        Authorization,
      },
      body: '{"nftId": 232}',
    };

    const actualResult = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid or missing.',
      data: ['minPrice is a required field', '"nftId" is not allowed'],
    });
    expect(actualResult).toEqual(expectedResult);
  });

  it('should pass', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mockResponse.myNFT }),
    });
    updateSpy.mockReturnValue({
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
      body: JSON.stringify({ minPrice: 11 }),
    };

    const actualResult = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'The minimum price of NFT has been set successfully.',
      data: { nftId: 'f353q50jg949', minPrice: 11 },
    });
    expect(actualResult).toEqual(expectedResult);
  });
});
