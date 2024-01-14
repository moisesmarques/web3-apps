/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../list-sharing-nft');
const utils = require('../../../utils');
const data = require('./mock/request.json');

describe('Test List-Sharing-NFTs', () => {
  let getSpy; let
    querySpy;
  let verifyAccessTokenSpy;
  beforeAll(() => {
    // Bypass the DynamoDB oprations during Test Case
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    querySpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
    // Bypass the JWT oprations during Test Case
    verifyAccessTokenSpy = jest.spyOn(utils, 'verifyAccessToken');
  });

  // Clean up mocks
  afterAll(() => {
    getSpy.mockRestore();
    querySpy.mockRestore();
    verifyAccessTokenSpy.mockRestore();
  });

  it('should fail when token is missing', async () => {
    verifyAccessTokenSpy.mockImplementationOnce(async () => {
      throw new Error('Access Token is required.');
    });
    const event = {
      httpMethod: 'GET',
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Error Sharing NFT's",
      data: 'Access Token is required.',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when invalid token', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve(data.myNft),
    });
    const event = {
      httpMethod: 'GET',
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: "Error Sharing NFT's",
      data: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when UserId is not valid', async () => {
    verifyAccessTokenSpy.mockReturnValue(
      Promise.resolve({
        walletId: undefined,
        walletName: undefined,
      }),
    );
    const event = {
      httpMethod: 'GET',
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: "Error Sharing NFT's",
      data: 'User not found!!',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass with valid token', async () => {
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [data.myNft] }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [data.jwtMock] }),
    });
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: data.myNft }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: data.jwtMock }),
    });
    verifyAccessTokenSpy.mockReturnValue(
      Promise.resolve({
        walletId: 'titusWallet.near',
        walletName: 'titusWallet.near',
      }),
    );
    const event = {
      httpMethod: 'GET',
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: "NFT's sharing with other retrieved successfully.",
      nfts: [],
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
    expect(result.message).toEqual(expectedResult.message);
  });
});
