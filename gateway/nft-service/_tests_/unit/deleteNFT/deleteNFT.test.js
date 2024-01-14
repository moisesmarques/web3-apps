/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

const sinon = require('sinon');
const lambda = require('../../../delete');
const utils = require('../../../utils');
const data = require('./mock/request');

describe('Test delete-nft', () => {
  let getSpy;
  let deletSpy;

  beforeAll(() => {
    // It is just the way to bypass the DynamoDB oprations during Test Case
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    deletSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
    // It is just the way to bypass the JWT oprations during Test Case
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
  });

  afterAll(() => {
    sinon.restore();
  });

  it('should fail when token is missing', async () => {
    const event = {
      httpMethod: 'DELETE',
      pathParameters: {
        nftId: data.nftId,
      },
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error in delete NFT',
      data: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when nftId is missing on path param', async () => {
    const event = {
      httpMethod: 'DELETE',
      pathParameters: {},
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Missing nftId path param',
      data: {},
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when NFT not found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'DELETE',
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'NFT does not exist.',
      data: {},
    });
    expect(result).toEqual(expectedResult);
  });
  it('should fail when user is not owner of NFT.', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({
        Item: {
          nftId: 'myNftID1',
          transactionId: '12345689',
          ownerWalletId: '23erercffef',
        },
      }),
    });
    const event = {
      httpMethod: 'DELETE',
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
  it('should fail when ownerId not found in NFT.', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({
        Item: {
          nftId: 'myNftID1',
          transactionId: '12345689',
        },
      }),
    });
    const event = {
      httpMethod: 'DELETE',
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Owner Wallet ID is missing.',
      data: {},
    });
    expect(result).toEqual(expectedResult);
  });
  it('should pass with NFT deleted successfully message.', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({
        Item: {
          nftId: 'myNftID1',
          transactionId: '12345689',
          ownerWalletId: 'titusWallet.near',
        },
      }),
    });
    deletSpy.mockReturnValue({
      promise: () => Promise.resolve({
        Item: {},
      }),
    });
    const event = {
      httpMethod: 'DELETE',
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'NFT deleted successfully.',
      data: {},
    });
    expect(result).toEqual(expectedResult);
  });
});
