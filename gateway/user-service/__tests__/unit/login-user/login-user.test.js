const { StatusCodes } = require('http-status-codes');
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const SNS = require('aws-sdk/clients/sns');
const axios = require('axios');
const { APIClient } = require('customerio-node');
const utils = require('../../../utils');
const { handler } = require('../../../lambda/login-user');

jest.mock('axios');
jest.mock('customerio-node');

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

jest.mock('aws-sdk/clients/ssm', () => {
  const mockSSM = {
    getParameter: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
  };
  return jest.fn(() => mockSSM);
});

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

// const ssm = new SSM();
const dynamoDbDocumentClient = new DocumentClient();
const snsClient = new SNS();
const customerIoApi = new APIClient();

describe('Calling Login User Handler To Test', () => {
  it('invalid json', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: [],
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      status: false,
      message: 'content should be JSON',
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
      errors: ['walletID is a required field'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId is empty', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ walletID: '' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['walletID must contain value'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId type is invalid', async () => {
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ walletID: 12323 }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['walletID must be a type of string'],
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

  it('should fail when walletId not found', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
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
      message: 'Account ID not found',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when user ID invalid', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    axios.get.mockImplementationOnce(() => Promise.reject({ response: { status: 400 } }));
    dynamoDbDocumentClient.query().promise.mockResolvedValueOnce({
      Count: 1,
      Items: [{
        email: 'test@xyz.com', userId: 'asdjkaljsdkl', code: 1233, ttl: new Date(),
      }],
    }).mockResolvedValueOnce({
      Count: 1,
      Items: [{
        email: 'test@xyz.com', userId: 'asdjkaljsdkl', code: 1233, ttl: new Date(),
      }],
    }).mockResolvedValue({
      Count: 0,
      Items: [],
    });
    dynamoDbDocumentClient.delete().promise.mockResolvedValue({});
    dynamoDbDocumentClient.put().promise.mockResolvedValue({ Item: [] });
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ walletID: 'wallet.near' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Invalid user ID or does not exist',
    });
    expect(result).toEqual(expectedResult);
  });

  it('login using email success case', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    axios.get.mockImplementationOnce(() => Promise.reject({ response: { status: 400 } }));
    dynamoDbDocumentClient.query().promise.mockResolvedValue({
      Count: 1,
      Items: [{
        email: 'test@xyz.com', userId: 'asdjkaljsdkl', code: 1233, ttl: new Date(),
      }],
    });
    dynamoDbDocumentClient.delete().promise.mockResolvedValue({});
    dynamoDbDocumentClient.put().promise.mockResolvedValue({});
    customerIoApi.sendEmail.mockImplementationOnce(() => ({}));
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ walletID: 'wallet.near' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      walletId: 'wallet.near',
      channelType: 'email',
      email: 'te**@.com',
    });
    expect(result).toEqual(expectedResult);
  });

  it('login using email success case and channelType phone', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    axios.get.mockImplementationOnce(() => Promise.reject({ response: { status: 400 } }));
    dynamoDbDocumentClient.query().promise.mockResolvedValue({
      Count: 1,
      Items: [{
        phone: '8981230110', userId: 'asdjkaljsdkl', code: 1233, ttl: new Date(),
      }],
    });
    dynamoDbDocumentClient.delete().promise.mockResolvedValue(true);
    dynamoDbDocumentClient.put().promise.mockResolvedValue({ Item: [] });
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ walletID: 'wallet.near', channelType: 'phone' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      walletId: 'wallet.near',
      channelType: 'phone',
      phone: '******0110',
    });
    expect(result).toEqual(expectedResult);
  });

  it('login using phone success case', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    axios.get.mockImplementationOnce(() => Promise.reject({ response: { status: 400 } }));
    dynamoDbDocumentClient.query().promise.mockResolvedValue({
      Count: 1,
      Items: [{
        phone: '8981230110', userId: 'asdjkaljsdkl', code: 1233, ttl: new Date(),
      }],
    });
    dynamoDbDocumentClient.delete().promise.mockResolvedValue(true);
    dynamoDbDocumentClient.put().promise.mockResolvedValue({ Item: [] });
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ walletID: 'wallet.near', channelType: 'phone' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      walletId: 'wallet.near',
      channelType: 'phone',
      phone: '******0110',
    });
    expect(result).toEqual(expectedResult);
  });

  it('login using phone success case and channelType email', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    axios.get.mockImplementationOnce(() => Promise.reject({ response: { status: 400 } }));
    dynamoDbDocumentClient.query().promise.mockResolvedValue({
      Count: 1,
      Items: [{
        email: 'test@fa.com', userId: 'asdjkaljsdkl', code: 1233, ttl: new Date(),
      }],
    });
    dynamoDbDocumentClient.delete().promise.mockResolvedValue(true);
    dynamoDbDocumentClient.put().promise.mockResolvedValue({ Item: [] });
    snsClient.publish().promise.mockResolvedValue(true);
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ walletID: 'wallet.near', channelType: 'phone' }),
    };

    const result = await handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      walletId: 'wallet.near',
      channelType: 'email',
      email: 'te**@f*.com',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when user is registered with email', async () => {
    // eslint-disable-next-line prefer-promise-reject-errors
    axios.get.mockImplementationOnce(() => Promise.reject({ response: { status: 400 } }));
    dynamoDbDocumentClient.query().promise.mockResolvedValue({
      Count: 1,
      Items: [{
        userId: 'asdjkaljsdkl', code: 1233, ttl: new Date(),
      }],
    });
    dynamoDbDocumentClient.delete().promise.mockResolvedValue(true);
    dynamoDbDocumentClient.put().promise.mockResolvedValue({ Item: [] });
    snsClient.publish().promise.mockResolvedValue(true);
    const event = {
      httpMethod: 'post',
      pathParameters: {},
      headers: {},
      body: JSON.stringify({ walletID: 'wallet.near', channelType: 'phone' }),
    };

    const result = await handler(event);
    console.log(result);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'User is registered with email',
    });
    expect(result).toEqual(expectedResult);
  });
});
