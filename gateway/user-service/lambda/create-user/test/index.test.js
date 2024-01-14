const { StatusCodes } = require('http-status-codes');
const axios = require('axios');
const AWS = require('aws-sdk');
const mockRequest = require('./mock/request.json');
const mockResponse = require('./mock/response.json');

const lambda = require('../index');
const utils = require('../../../utils');

jest.mock('axios');

jest.mock('aws-sdk', () => {
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
  };

  const mockSSM = {
    getParameter: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
  };

  return {
    SSM: jest.fn(() => mockSSM),
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDynamoDBClient),
    },
  };
});

const ssm = new AWS.SSM();
const dynamoDbDocumentClient = new AWS.DynamoDB.DocumentClient();

describe('Calling Create User Handler ', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  beforeAll(() => {
    ssm.getParameter().promise.mockResolvedValue(mockResponse.ssmGetParamResponse);
  });

  beforeEach(() => {
    jest.resetModules();
  });

  it('should fail when whole body is missing', async () => {
    const event = {
      httpMethod: 'POST',
    };

    // Invoke create-user()
    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Unexpected token u in JSON at position 0',
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail if any of the required is missing', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({}),
    };

    // Invoke create-user()
    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: [
        'walletId is a required field',
        'firstName is a required field',
        'lastName is a required field',
        'Email or Phone is required',
      ],
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail if phone is provided but country code is missing', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockRequest.phoneWithoutCountryCodeSample),
    };

    // Invoke create-user()
    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['Phone and Country Code are both required'],
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail if phone already exists', async () => {
    dynamoDbDocumentClient.query().promise.mockResolvedValue({ Count: 1 });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockRequest.phoneSample),
    };

    // Invoke create-user()
    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.CONFLICT, {
      message: 'Phone already exist',
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail if email already exists', async () => {
    dynamoDbDocumentClient.query().promise.mockReturnValue({ Count: 1 });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockRequest.emailSample),
    };

    // Invoke create-user()
    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.CONFLICT, {
      message: 'Email already exist',
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail if account already exists', async () => {
    // by pass email
    dynamoDbDocumentClient.query().promise.mockReturnValueOnce({ Count: 0 });

    // by pass  wallet
    dynamoDbDocumentClient.query().promise.mockReturnValueOnce(mockResponse.dynamodbQueryResponse);

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockRequest.emailSample),
    };

    // Invoke create-user()
    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.CONFLICT, {
      message: 'Account ID already exist',
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should pass to create user successfully by email', async () => {
    // by pass indexerWalletCheck
    axios.get.mockImplementationOnce(() => Promise.reject({ response: { status: 400 } }));

    // by pass email  and wallet
    dynamoDbDocumentClient.query().promise.mockReturnValue({ Count: 0 });

    // by pass create user
    dynamoDbDocumentClient.put().promise.mockReturnValue();

    // by pass getWalletsByUserID
    axios.get.mockImplementationOnce(() => Promise.resolve(mockResponse.axiosGetResponse));

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockRequest.emailSample),
    };

    // Invoke create-user()
    let result = await lambda.handler(event);
    result = JSON.parse(result.body);

    expect(result).toBeDefined();
    expect(result).not.toBeNull();
    expect(result.jwtAccessToken).toBeDefined();
    expect(result.jwtRefreshToken).toBeDefined();
    expect(result.user).toMatchObject(mockRequest.emailSample);
  });

  it('should pass to create user successfully by phone', async () => {
    // by pass indexerWalletCheck
    axios.get.mockImplementationOnce(() => Promise.reject({ response: { status: 400 } }));

    // by pass phone  and wallet
    dynamoDbDocumentClient.query().promise.mockReturnValue({ Count: 0 });

    // by pass create user
    dynamoDbDocumentClient.put().promise.mockReturnValue();

    // by pass getWalletsByUserID
    axios.get.mockImplementationOnce(() => Promise.resolve(mockResponse.axiosGetResponse));

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockRequest.phoneSample),
    };

    // Invoke create-user()
    let result = await lambda.handler(event);
    result = JSON.parse(result.body);

    expect(result).toBeDefined();
    expect(result).not.toBeNull();
    expect(result.jwtAccessToken).toBeDefined();
    expect(result.jwtRefreshToken).toBeDefined();
    expect(result.user).toMatchObject(mockRequest.phoneSample);
  });
});
