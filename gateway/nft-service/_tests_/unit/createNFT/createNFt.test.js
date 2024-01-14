// @ts-nocheck
/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const lambda = require('../../../create');
const utils = require('../../../utils');
const data = require('./mock/request');

describe('Test create-nft', () => {
  let getSpy;
  let putSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock1);
  });

  afterAll(() => {
    getSpy.mockRestore();
    sinon.restore();
  });

  mockGetById = jest.fn();
  mockCreateNFT = jest.fn();

  jest.mock('../../../lib/model/categories', () => ({
    NftCategories: jest.fn().mockImplementation(() => ({
      getById: mockGetById,
    })),
  }));

  jest.mock('../../../lib/model/nft', () => ({
    nft: jest.fn().mockImplementation(() => ({
      createNFT: mockCreateNFT,
    })),
  }));

  jest.mock('../../../lib/model/categories', () => ({
    NftCategories: jest.fn(),
  }));
  jest.mock('../../../lib/model/nft', () => ({ nft: jest.fn() }));

  it('should fail when body params are missing', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.emptyPayload),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error create NFT',
      data: 'Title is a required field',
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
      headers: {},
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error create NFT',
      data: 'invalid token',
    });

    expect(result).toEqual(expectedResult);
  });
  it('should fail when CategoryId is missing', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.invalidPayload),
      headers: {
        Authorization: data.AuthCode,
      },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Error create NFT',
      data: "NFT category 'XNwyaIOPKkfc1iFngXor' not found",
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass with valid payload', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.nft }),
    });
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });
    mockGetById.mockReturnValue(data.nft);
    mockCreateNFT.mockReturnValue({});

    jest.spyOn(utils, 'callServerRequest').mockResolvedValueOnce({
      body: data.successResponse,
      statusCode: 200,
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.payload),
      headers: {
        Authorization: data.AuthCode,
      },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'NFT created successfully.',
    });
    expect(JSON.parse(result.body)).toMatchObject(
      JSON.parse(expectedResult.body),
    );
  });

  it('should fail when create transaction fails', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.nft }),
    });
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });
    mockGetById.mockReturnValue(data.nft);
    mockCreateNFT.mockReturnValue({});

    jest.spyOn(utils, 'callServerRequest').mockResolvedValueOnce({
      body: data.successResponse,
      statusCode: 404,
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.payload),
      headers: {
        authorization: data.AuthCode,
      },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error create NFT',
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
    expect(result.message).toEqual(expectedResult.message);
  });

  it('should fail due to InternalServerError', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.reject({ Item: data.nft }),
    });
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });
    mockGetById.mockReturnValue(data.nft);
    mockCreateNFT.mockReturnValue({});

    jest.spyOn(utils, 'callServerRequest').mockResolvedValueOnce({
      body: data.successResponse,
      statusCode: 404,
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.payload),
      headers: {
        authorization: data.AuthCode,
      },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error create NFT',
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
    expect(result.message).toEqual(expectedResult.message);
  });
});
