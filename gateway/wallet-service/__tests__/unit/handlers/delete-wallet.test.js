const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../lambda/delete-wallet/index');
const utils = require('../../../src/helpers/utils');

const wallet = require('../../../.jest/mock/wallet.json');
const headers = require('../../../.jest/mock/headers.json');

describe('Test delete-wallet', () => {
  let getSpy;
  let updateSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
  });

  afterAll(() => {
    getSpy.mockRestore();
    updateSpy.mockRestore();
  });

  it('should fail when walletId is missing', async () => {
    const event = {
      httpMethod: 'DELETE',
      headers,
      pathParameters: {},
      body: JSON.stringify({}),
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

    const { walletId } = wallet;
    const event = {
      httpMethod: 'DELETE',
      headers,
      pathParameters: { walletId: 'something-unknown' },
      body: JSON.stringify({}),
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

    const { walletId } = wallet;
    const event = {
      httpMethod: 'DELETE',
      headers,
      pathParameters: { walletId },
      body: JSON.stringify({}),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authorized to perform this operation',
    });
    expect(result).toEqual(expectedResult);
  });
});
