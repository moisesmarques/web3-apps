const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../lambda/import-wallet/index');
const utils = require('../../../src/helpers/utils');

const wallet = require('../../../.jest/mock/wallet.json');
const headers = require('../../../.jest/mock/headers.json');

describe('Test import-wallet', () => {
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

  it('should import wallet by privateKey', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: wallet }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Attributes: wallet }),
    });

    const {
      userId,
      walletId,
      walletName,
      blockchainHash,
      publicKey,
      isPrimary,
      status,
      balance,
      created,
    } = wallet;

    const event = {
      httpMethod: 'POST',
      headers,
      pathParameters: {},
      body: JSON.stringify({
        walletName: 'codetestkit.near',
        privateKey:
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.CREATED, {
      userId,
      walletName,
      blockchainHash,
      publicKey,
      isPrimary,
      status,
      balance,
      blockchainExplorerUrl: `http://example.com/${walletId}`, // TODO: Update this url
      created,
    });

    expect(result).toEqual(expectedResult);
  });

  it('should when passPhrases are not 12 words', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: wallet }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Attributes: wallet }),
    });

    const {
      userId,
      walletId,
      walletName,
      blockchainHash,
      publicKey,
      isPrimary,
      status,
      balance,
      created,
    } = wallet;

    const event = {
      httpMethod: 'POST',
      headers,
      pathParameters: {},
      body: JSON.stringify({
        walletName: 'codetestkit.near',
        passPhrases: 'three-word-passphrase',
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'passPhrases should be 12 words',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletName is missing from payload', async () => {
    const event = {
      httpMethod: 'POST',
      headers,
      pathParameters: {},
      body: JSON.stringify({}),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'walletName is a required field',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when invalid data is in payload', async () => {
    const event = {
      httpMethod: 'POST',
      headers,
      pathParameters: {},
      body: JSON.stringify({
        walletName: 'codetestkit.near',
        something: 'invalid',
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: '"something" is not allowed',
    });
    expect(result).toEqual(expectedResult);
  });
});
