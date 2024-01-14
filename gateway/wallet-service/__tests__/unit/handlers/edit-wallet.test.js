const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../lambda/edit-wallet/index');
const utils = require('../../../src/helpers/utils');

const wallet = require('../../../.jest/mock/wallet.json');
const headers = require('../../../.jest/mock/headers.json');

describe('Test edit-wallet', () => {
  const {
    walletId,
    walletName,
    status,
    imageUrlPath,
    priceLimit,
    kycProvider,
    storageProvider,
  } = wallet;

  let updateMock;
  let getMock;

  beforeAll(() => {
    updateMock = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
    getMock = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
  });

  afterAll(() => {
    updateMock.mockRestore();
    getMock.mockRestore();
  });

  it('should fail when no authorization is passed', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {},
      pathParameters: {
        walletId,
      },
      body: JSON.stringify({
        walletName,
        status,
        imageUrlPath,
        priceLimit,
        kycProvider,
        storageProvider,
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should update wallet to the table', async () => {
    updateMock.mockReturnValue({
      promise: () => Promise.resolve({ Attributes: wallet }),
    });
    getMock.mockReturnValue({
      promise: () => Promise.resolve({ Item: wallet }),
    });

    const event = {
      httpMethod: 'POST',
      headers,
      pathParameters: {
        walletId,
      },
      body: JSON.stringify({
        walletName,
        status,
        imageUrlPath,
        priceLimit,
        kycProvider,
        storageProvider,
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.ACCEPTED, {
      message: 'Wallet update successful',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId is missing', async () => {
    const event = {
      httpMethod: 'POST',
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

  it('should fail when walletId is present in payload', async () => {
    const event = {
      httpMethod: 'POST',
      headers,
      pathParameters: { walletId },
      body: JSON.stringify({
        walletId,
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'You are not allowed to update your NEAR wallet ID',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when invalid data is in payload', async () => {
    const event = {
      httpMethod: 'POST',
      headers,
      pathParameters: { walletId },
      body: JSON.stringify({
        something: 'invalid',
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'walletName is a required field',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when an unknown walletId is passed', async () => {
    getMock.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    const { walletId } = wallet;
    const event = {
      httpMethod: 'POST',
      headers,
      pathParameters: { walletId: 'something-unknown' },
      body: JSON.stringify({
        walletName,
        status,
        imageUrlPath,
        priceLimit,
        kycProvider,
        storageProvider,
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Invalid wallet ID or does not exist',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when a wallet userId mismatch with the logged in user', async () => {
    getMock.mockReturnValue({
      promise: () => Promise.resolve({ Item: { ...wallet, userId: 'something-invalid' } }),
    });

    const { walletId } = wallet;
    const event = {
      httpMethod: 'POST',
      headers,
      pathParameters: { walletId },
      body: JSON.stringify({
        walletName,
        status,
        imageUrlPath,
        priceLimit,
        kycProvider,
        storageProvider,
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authorized to perform this operation',
    });
    expect(result).toEqual(expectedResult);
  });
});
