const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../lambda/fetch-wallets/index');
const utils = require('../../../src/helpers/utils');

const wallets = require('../../../.jest/mock/wallets.json');
const environment = require('../../../.jest/mock/environment.json');
const headers = require('../../../.jest/mock/headers.json');

describe('Test fetch-wallet', () => {
  let mock;

  beforeAll(() => {
    mock = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
  });

  afterAll(() => {
    mock.mockRestore();
  });

  it('should fetch user wallets by userId', async () => {
    mock.mockReturnValue({
      promise: () => Promise.resolve({ Items: wallets }),
    });

    const event = {
      httpMethod: 'GET',
      headers,
      pathParameters: {},
      body: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.OK, wallets);

    expect(mock).toBeCalledWith({
      TableName: environment.TABLE_NAME_WALLETS,
      IndexName: 'userId-Index',
      KeyConditionExpression: 'userId= :userId',
      ExpressionAttributeValues: { ':userId': environment.userId },
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when an expired jwt token is passed', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {
        Authorization: headers.ExpiredAuthorization,
      },
      pathParameters: {},
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
      pathParameters: {},
      body: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });
});
