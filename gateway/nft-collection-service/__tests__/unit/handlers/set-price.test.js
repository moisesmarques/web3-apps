/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const sinon = require('sinon');
const lambda = require('../../../price-limit');
const utils = require('../../../utils');
const mock = require('./mock.json');

describe('It allows to set price limit of NFT Collection', () => {
  let getSpy;
  let updateSpy;

  beforeAll(() => {
    // It is just the way to bypass the DynamoDB oprations during Test Case
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');

    // It is just the way to bypass the JWT oprations during Test Case
    sinon.stub(jwt, 'verify').callsFake(() => mock.user);
  });

  // Clean up mocks
  afterAll(() => {
    sinon.restore();
    getSpy.mockRestore();
    updateSpy.mockRestore();
  });

  it('should fail when nftId is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: { Authorization: mock.Authorization },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "nftId" is required.',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when nft details not found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: { nftId: mock.nftId },
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        minPrice: '20',
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `NFT not found by nftId: ${mock.nftId} !`,
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when auth is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { nftId: mock.nftId },
      headers: {},
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: '{"message":"invalid token"}',
    });

    const expectedResultBody = JSON.parse(expectedResult.body);

    expect(result).toEqual(expectedResultBody);
  });

  it('it should fail due to schema validation', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { nftId: mock.nftId },
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        minPrice: '@@',
      }),
    };

    const result = await lambda.handler(event);
    const body = JSON.parse(result.body);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid or missing.',
      data: body.data,
    });

    expect(result).toEqual(expectedResult);
  });

  it('it should set price', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mock.myNFT }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: { nftId: mock.nftId },
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        minPrice: '20',
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'The minimum price of NFT has been set successfully.',
      data: JSON.parse(result.body).data,
    });

    expect(result).toEqual(expectedResult);
  });
});
