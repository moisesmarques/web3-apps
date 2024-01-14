/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const lambda = require('../../../list');
const utils = require('../../../utils');
const { listNftByOwnerId } = require('../../../lib/model/nft');
const { getTransactionById } = require('../../../lib/model/transaction');
const { getFileById } = require('../../../lib/model/files');

const data = require('./mock/request');
const {
  listNftMock, transactionMock, response200, filesMock,
} = require('./mock/response');

jest.mock('../../../lib/model/nft', () => ({ listNftByOwnerId: jest.fn() }));
jest.mock('../../../lib/model/transaction', () => ({ getTransactionById: jest.fn() }));
jest.mock('../../../lib/model/files', () => ({ getFileById: jest.fn() }));
let jwt_data = '';
describe('Test list-nft', () => {
  beforeAll(() => {
    // It is just the way to bypass the DynamoDB oprations during Test Case
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    // It is just the way to bypass the JWT oprations during Test Case
    sinon.stub(jwt, 'verify')
      .callsFake(() => jwt_data);
  });

  afterAll(() => {
    sinon.restore();
  });

  it('should return 200 with nfts - scenario 1', async () => {
    jwt_data = data.jwtMock;
    const event = {
      httpMethod: 'GET',
      pathParameters: { },
      headers: { Authorization: data.AuthCode },
    };
    listNftByOwnerId.mockResolvedValueOnce(listNftMock);
    getTransactionById.mockResolvedValueOnce(transactionMock);
    getFileById.mockResolvedValueOnce(filesMock);
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'NFT Collections retrieved successfully.',
      data: response200,
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should return 200 with nfts - scenario 2', async () => {
    jwt_data = data.jwtMock;
    const event = {
      httpMethod: 'GET',
      pathParameters: { },
      headers: { Authorization: data.AuthCode },
    };
    listNftByOwnerId.mockResolvedValueOnce(listNftMock);
    getTransactionById.mockResolvedValueOnce(undefined);
    getFileById.mockResolvedValueOnce(filesMock);
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'NFT Collections retrieved successfully.',
      data: response200,
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
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
      message: 'Error NFT Collection', data: 'invalid token',
    });

    expect(result).toEqual(expectedResult);
  });
  it('should fail when userId is not exist', async () => {
    jwt_data = data.wrongjwtMock;
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error NFT Collection', data: "User does not have any wallet associated with it's identity",
    });
    expect(result).toEqual(expectedResult);
  });
  it('should return 500 Internal server error', async () => {
    jwt_data = data.jwtMock;
    const event = {
      httpMethod: 'GET',
      pathParameters: { },
      headers: { Authorization: data.AuthCode },
    };
    listNftByOwnerId.mockRejectedValueOnce('Table is invalid');
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error NFT Collection',
    });
    expect(result).toEqual(expectedResult);
  });
});
