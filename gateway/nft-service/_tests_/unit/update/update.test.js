/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const lambda = require('../../../update');
const utils = require('../../../utils');
const data = require('./mock/request');

describe('Test update-nft', () => {
  let getSpy;
  let updateSpy;
  beforeAll(() => {
    // It is just the way to bypass the DynamoDB operation during Test Case
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
    // It is just the way to bypass the JWT operation during Test Case
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should fail when body params are missing', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.emptyPayload),
      pathParameters: {
        nftIf: data.nftId,
      },
      headers: {
        authorization: data.AuthCode,
      },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error update NFT',
      data: 'Missing nftId path param',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when Auth token is missing', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.payload),
      pathParameters: {
        nftIf: data.nftId,
      },
      headers: {},
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error update NFT',
      data: 'invalid token',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when description is empty', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.emptyDescriptionpayload),
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error update NFT',
      data: 'description is not allowed to be empty',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when price is invalid', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.incorrectPricepayload),
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error update NFT',
      data: 'price is required',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when InternalServerError', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.reject({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.correctPricepayload),
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error update NFT',
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
    expect(result.message).toEqual(expectedResult.message);
  });

  it('should fail when NFT is not belongs to you', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.reject({ code: 'ConditionalCheckFailedException' }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.correctPricepayloadNotBelongs),
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error update NFT',
      data: "\"NFT 'R6lCzCQE9sutEtWGkLFbp' is not found or you don't have the right to update it\"",
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
    expect(result.message).toEqual(expectedResult.message);
  });

  it('should pass when price is valid and description is not empty', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.correctPricepayload),
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'NFT updated successfully.',
    });
    expect(result).toEqual(expectedResult);
  });
});
