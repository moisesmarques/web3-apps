const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../lambda/retrieve-wallet/index');
const utils = require('../../../src/helpers/utils');

const wallet = require('../../../.jest/mock/wallet.json');
const headers = require('../../../.jest/mock/headers.json');

describe('Test retrieve-wallet', () => {
  const { walletId } = wallet;
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should fail when an expired jwt token is passed', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {
        Authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3VudHJ5Q29kZSI6IisxIiwibGFzdE5hbWUiOiJEb2UiLCJ1c2VySWQiOiJjYm5SWHU0TGhjdWRCZkNHakpJaFYiLCJzdGF0dXMiOiJhY3RpdmUiLCJjcmVhdGVkIjoxNjQ2NjUyNDUyMTU4LCJpc1Bob25lVmVyaWZpZWQiOmZhbHNlLCJlbWFpbCI6ImlhbkB2dWUuY28ua2UiLCJmaXJzdE5hbWUiOiJKb2huIiwiaXNFbWFpbFZlcmlmaWVkIjpmYWxzZSwid2FsbGV0TmFtZSI6ImNvZGV0ZXN0a2l0Mjg3MzkxNzg5NzI4OTE3Lm5lYXIiLCJpYXQiOjE2NDcwNTgyNDUsImV4cCI6MTY0NzA1ODI0NX0.eZldEqxOHTTpIeX79hepbSLtWQF9j12NK_hN2bxAdik',
      },
      pathParameters: { walletId },
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
      pathParameters: { walletId },
      body: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should retrieve wallet by walletId', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: wallet }),
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

    const expectedResult = utils.send(StatusCodes.OK, wallet);

    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      headers,
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
      pathParameters: { walletId: 'unknown-wallet' },
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
      promise: () => Promise.resolve({ Item: { ...wallet, userId: 'something-invalid' } }),
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
