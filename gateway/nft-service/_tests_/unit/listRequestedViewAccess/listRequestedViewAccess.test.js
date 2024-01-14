/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const lambda = require('../../../listRequests');
const utils = require('../../../utils');
const data = require('./mock/request.json');

describe('Test List-NFTs-Request-Access', () => {
  let getSpy;
  let querySpy;

  beforeAll(() => {
    // Bypass the DynamoDB oprations during Test Case
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    querySpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
    // Bypass the JWT oprations during Test Case
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
  });

  // Clean up mocks
  afterAll(() => {
    getSpy.mockRestore();
    querySpy.mockRestore();

    sinon.restore();
  });

  it('should fail when token is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { nftId: data.nftId },
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error detail NFT',
      data: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when invalid token', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve(data.myNft),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: { nftId: data.nftId },
      headers: {
        Authorization: undefined,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error detail NFT',
      data: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when NftId is missing in param', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error detail NFT',
      data: 'Missing nftId path param',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when User is not owner', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: { ...data.myNft, ownerWalletId: 'abc.near' } }),
    });
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: data.AccessList }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'User is not the owner.',
      data: {},
    });
    expect(result).toEqual(expectedResult);
  });
  it('should fail when nftId is not found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: data.wrongnftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, { message: 'Error detail NFT', data: `NFT '${data.wrongnftId}' not found` });
    expect(result).toEqual(expectedResult);
  });
  it('it should pass', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.myNft }),
    });
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: data.AccessList }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'List NFT access requests.',
      data: JSON.parse(result.body).data,
    });
    expect(result).toEqual(expectedResult);
  });
});
