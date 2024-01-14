const { StatusCodes } = require('http-status-codes');
const axios = require('axios');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const utils = require('../../../utils');
const { handler } = require('../index');

jest.mock('axios');

jest.mock('aws-sdk/clients/ses', () => {
  const mockSES = {
    sendEmail: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
  };
  return jest.fn(() => mockSES);
});
jest.mock('aws-sdk/clients/sns', () => {
  const mockSNS = {
    publish: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
  };
  return jest.fn(() => mockSNS);
});

jest.mock('aws-sdk/clients/dynamodb', () => {
  const mockDynamoDBClient = {
    get: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
    query: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
    put: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
    delete: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
  };
  return {
    DocumentClient: jest.fn(() => mockDynamoDBClient),
  };
});
const dynamoDbDocumentClient = new DynamoDB.DocumentClient();

describe('Calling Check Email Handler To Test', () => {
  it('invalid json', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: [],
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Unexpected end of JSON input',
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should fail when email pattern does not match', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ email: 'aksjdlkas' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['email fails to match the required pattern'],
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should fail when email is found', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ email: 'muhammad.zubair@primelab.io' }),
    };
    dynamoDbDocumentClient.query().promise.mockResolvedValueOnce({ Count: 1 });
    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.CONFLICT, {
      message: 'email address already exists',
    });
    expect(result).toEqual(expectedResult);
  });

  it('success case', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ email: 'loremipsum@xyz.com' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'email address does not exist',
    });
    expect(result).toEqual(expectedResult);
  });
});
