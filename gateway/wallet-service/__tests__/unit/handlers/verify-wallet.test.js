const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../lambda/verify-wallet/index');
const utils = require('../../../src/helpers/utils');

const wallet = require('../../../.jest/mock/wallet.json');
const headers = require('../../../.jest/mock/headers.json');

describe('Test verify-wallet', () => {
  const { walletId } = wallet;
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should verify wallet by walletId', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: wallet }),
    });

    const {
      walletId, userId, walletName, blockchainHash, status, created,
    } = wallet;

    const event = {
      httpMethod: 'GET',
      headers,
      pathParameters: {
        walletId: wallet.walletId,
      },
      body: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'wallet verification successful',
      walletId,
      userId,
      walletName,
      blockchainHash,
      status,
      created,
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when an expired jwt token is passed', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {
        Authorization: headers.ExpiredAuthorization,
      },
      pathParameters: {
        walletId: wallet.walletId,
      },
      body: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'jwt expired',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no authorization is passed', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {},
      pathParameters: {
        walletId: wallet.walletId,
      },
      body: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {},
      pathParameters: {},
      body: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'walletId missing in the request!',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when an unknown walletId is passed', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    const event = {
      httpMethod: 'GET',
      headers,
      pathParameters: {
        walletId,
      },
      body: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Invalid wallet ID or does not exist',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when a wallet userId mismatch with the logged in user', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: { ...wallet, userId: 'unknown' } }),
    });

    const event = {
      httpMethod: 'GET',
      headers,
      pathParameters: {
        walletId,
      },
      body: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authorized to perform this operation',
    });
    expect(result).toEqual(expectedResult);
  });
});
