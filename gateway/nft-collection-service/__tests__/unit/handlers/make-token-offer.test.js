/* eslint-disable no-undef */

const dynamodb = require('aws-sdk/clients/dynamodb');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const sinon = require('sinon');
const lambda = require('../../../make-token-offer');
const utils = require('../../../utils');
const mock = require('./mock.json');

describe('It allows to make-token-offer of NFT Collection', () => {
  let getSpy;
  let putSpy;

  beforeAll(() => {
    // It is just the way to bypass the DynamoDB oprations during Test Case
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    querySpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
    // It is just the way to bypass the JWT oprations during Test Case
    sinon.stub(jwt, 'verify').callsFake(() => mock.newUser);
  });

  // Clean up mocks
  afterAll(() => {
    sinon.restore();
    getSpy.mockRestore();
    querySpy.mockRestore();
    putSpy.mockRestore();
  });

  it('should fail when nftId is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      body: JSON.stringify({}),
      headers: { Authorization: mock.Authorization },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "nftId" is required.',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail due to schema validation', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { nftId: mock.nftId },
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        Price: '@@',
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid or missing.',
    });

    expect(result.statusCode).toEqual(expectedResult.statusCode);
    expect(result.message).toEqual(expectedResult.message);
  });

  it('should pass when invalid nftId is found', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [mock.sharedNft] }),
    });
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: { nftId: mock.nftId },
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        offerPrice: '10',
        offerType: 'NFT',
        expire: +new Date(),
        userId: 'apcerg',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `NFT not found by nftId: ${mock.nftId} !`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail with InternalServerError', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.reject(new Error('Internal server error')),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: { nftId: mock.nftId },
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        offerPrice: 10,
        offerType: 'NFT',
        expire: +new Date(),
        userId: 'apcerg',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Internal server error',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass when offerPrice less than NFT price', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mock.myNFT }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: { nftId: mock.nftId },
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        offerPrice: 10,
        offerType: 'NFT',
        expire: +new Date(),
        userId: 'apcerg',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Offering price is low than minimum. minimum price: 11',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass when offerPrice more than NFT price', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mock.myNFT }),
    });
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mock.myNFT }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: { nftId: mock.nftId },
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        offerPrice: 12,
        offerType: 'NFT',
        expire: +new Date(),
        userId: 'apcerg',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'The TOKEN offer has been initialized successfully.',
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
    expect(result.message).toEqual(expectedResult.message);
  });
});
