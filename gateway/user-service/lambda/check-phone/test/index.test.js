const { StatusCodes } = require('http-status-codes');
const SNS = require('aws-sdk/clients/sns');
const SES = require('aws-sdk/clients/ses');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const axios = require('axios');
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
const sesClient = new SES();
const snsClient = new SNS();

describe('Calling Check Phone Handler To Test', () => {
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
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId is missing', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({}),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['walletID is a required field', 'phone is a required field'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId pattern does not match', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ walletID: 'aksjdlkas' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['walletID fails to match the required pattern'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId  or phone not found', async () => {
    axios.get.mockImplementationOnce(() => Promise.reject({ response: { status: 400 } }));
    dynamoDbDocumentClient.query().promise.mockResolvedValue({ Count: 0 });
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ walletID: 'wallet.near' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Phone does not exist',
    });
    expect(result).toEqual(expectedResult);
  });

  it('success case', async () => {
    dynamoDbDocumentClient.query().promise.mockResolvedValue({ Count: 1, Items: [{ phone: '9182938123' }] });
    snsClient.publish().promise.mockResolvedValue(true);
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ walletID: 'wallet.near' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'Sent OPT code to phone',
    });
    expect(result).toEqual(expectedResult);
  });
});
