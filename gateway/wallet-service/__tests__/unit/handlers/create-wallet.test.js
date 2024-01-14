const dynamodb = require('aws-sdk/clients/dynamodb');
const SSM = require('aws-sdk/clients/ssm');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../lambda/create-wallet/index');
const utils = require('../../../src/helpers/utils');

const wallet = require('../../../.jest/mock/wallet.json');
const headers = require('../../../.jest/mock/headers.json');

const Wallets = require('../../../src/models/wallets');

jest.mock('../../../src/models/wallets', () => jest.fn());

Wallets.upsertWallet = jest.fn();
Wallets.updateWalletWithTransactionId = jest.fn();

describe('Test create-wallet', () => {
  let mock;

  beforeAll(() => {
    mock = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
  });

  afterAll(() => {
    mock.mockRestore();
  });

  it('should fail when an expired jwt token is passed', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {
        Authorization: headers.ExpiredAuthorization,
      },
      pathParameters: {},
      body: JSON.stringify({
        walletName: wallet.walletName,
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'jwt expired',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no authorization is passed', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {},
      pathParameters: {},
      body: JSON.stringify({
        walletName: wallet.walletName,
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should add wallet to the table', async () => {
    jest.spyOn(utils, 'checkWalletNameExists').mockResolvedValueOnce(undefined);
    Wallets.upsertWallet.mockReturnValueOnce(wallet);
    Wallets.updateWalletWithTransactionId.mockReturnValueOnce(wallet);
    const event = {
      httpMethod: 'POST',
      headers,
      pathParameters: {},
      body: JSON.stringify({
        walletName: wallet.walletName,
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.CREATED, wallet);
    expect(result).toEqual(expectedResult);
  });

  it('should fail from payload missing walletName', async () => {
    const event = {
      httpMethod: 'POST',
      headers,
      pathParameters: {},
      body: JSON.stringify({
        wallet: wallet.walletName,
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid.',
      data: [
        {
          message: '"walletName" is required',
          path: ['walletName'],
          type: 'any.required',
          context: {
            label: 'walletName',
            key: 'walletName',
          },
        },
      ],
    });
    expect(result.message).toEqual(expectedResult.message);
  });

  it('should fail from payload having disallowed keys', async () => {
    const event = {
      httpMethod: 'POST',
      headers,
      pathParameters: {},
      body: JSON.stringify({
        walletName: wallet.walletName,
        something: 'unknown',
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid.',
      data: [
        {
          message: '"something" is not allowed',
          path: ['something'],
          type: 'object.unknown',
          context: {
            child: 'something',
            label: 'something',
            value: 'unknown',
            key: 'something',
          },
        },
      ],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail from payload missing', async () => {
    const event = {
      httpMethod: 'POST',
      headers,
      pathParameters: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Payload is missing',
    });
    expect(result).toEqual(expectedResult);
  });
});
