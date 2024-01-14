/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

const sinon = require('sinon');
const lambda = require('../../../get');
const utils = require('../../../utils');
const { getUser } = require('../../../lib/model/users');
const data = require('./mock/request');

jest.mock('../../../lib/model/users', () => ({ getUser: jest.fn() }));

describe('Test get-nft', () => {
  let getSpy;

  beforeAll(() => {
    // It is just the way to bypass the DynamoDB oprations during Test Case
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    // It is just the way to bypass the JWT oprations during Test Case
    sinon.stub(jwt, 'verify')
      .callsFake((req, res, next) => data.jwtMock);
  });

  afterAll(() => {
    sinon.restore();
  });

  it('should fail when nftId is missing on path param', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error detail NFT', data: 'Missing nftId path param',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when token is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: data.nftId,
      },
      headers: {},
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error detail NFT', data: 'invalid token',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when NFT not found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Error detail NFT', data: "NFT 'R6lCzCQE9sutEtWGkLFbp' not found",
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when user is not having the access of NFT', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.nftId }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.FORBIDDEN, {
      message: 'Error detail NFT', data: "You don't have the right to access NFT 'R6lCzCQE9sutEtWGkLFbp'",
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass when everything is right ', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.nft.data }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    getUser.mockResolvedValueOnce(data.fakeOwnerId);
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK);

    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });
});
