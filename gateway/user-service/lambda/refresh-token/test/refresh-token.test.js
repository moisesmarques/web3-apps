const axios = require('axios');
const AWS = require('aws-sdk');
const cloudfront = require('aws-cloudfront-sign');
const jwt = require('jsonwebtoken');
const mockRequest = require('./mock/request.json');
const mockResponse = require('./mock/response.json');
const { handler } = require('../index');
const Utils = require('../../../utils');
const sm = require('../../../src/lib/sm');

jest.mock('../../../utils', () => {
  const originalModule = jest.requireActual('../../../utils');

  return {
    ...originalModule,
    verifyRefreshToken: jest.fn(),
    dynamoDb: {
      ...originalModule.dynamoDb,
      query: jest.fn(),
      put: jest.fn(),

    },
    getAuthResponse: jest.fn(),
  };
});

jest.mock('../../../src/lib/sm', () => {
  const originalModule = jest.requireActual('../../../src/lib/sm');

  return {
    ...originalModule,
    getSecret: jest.fn(),
  };
});

jest.mock('aws-sdk', () => {
  const mockDynamoDBClient = {
    get: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
    query: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
    update: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
    scan: jest.fn().mockReturnValue({
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

jest.mock('axios');
jest.mock('jsonwebtoken');
jest.mock('aws-cloudfront-sign');

const ssm = new AWS.SSM();
const dynamoDbDocumentClient = new AWS.DynamoDB.DocumentClient();

describe('Calling refresh token Handler To Test', () => {
  let scanSpy;
  let verifyRefreshTokenSpy;
  let utilsDynamoDbQuerySpy;
  let getAuthResponseSpy;
  let getSecretSpy;
  let getSignedCookiesSpy;

  afterAll(() => {
    jest.resetAllMocks();
    scanSpy.mockRestore();
    verifyRefreshTokenSpy.mockRestore();
    utilsDynamoDbQuerySpy.mockRestore();
    getAuthResponseSpy.mockRestore();
    getSecretSpy.mockRestore();
    getSignedCookiesSpy.mockRestore();
  });

  beforeAll(() => {
    scanSpy = jest.spyOn(Utils.dynamoDb, 'scan');
    dynamoDbDocumentClient.get().promise.mockResolvedValue({ Item: '' }); //
    dynamoDbDocumentClient.query().promise.mockResolvedValue({ Count: 0 });
    dynamoDbDocumentClient.update().promise.mockResolvedValue(mockResponse.dynamodbUpdateResponse);
    ssm.getParameter().promise.mockResolvedValue(mockResponse.ssmGetParamResponse);//
    axios.get.mockResolvedValue(mockResponse.axiosGetResponse);
    verifyRefreshTokenSpy = jest.spyOn(Utils, 'verifyRefreshToken');
    utilsDynamoDbQuerySpy = jest.spyOn(Utils.dynamoDb, 'query');
    getAuthResponseSpy = jest.spyOn(Utils, 'getAuthResponse');
    getSecretSpy = jest.spyOn(sm, 'getSecret');
    getSignedCookiesSpy = jest.spyOn(cloudfront, 'getSignedCookies');
  });

  it('should be mocked successfully', async () => {
    expect(jest.isMockFunction(dynamoDbDocumentClient.get)).toBeTruthy();
    expect(jest.isMockFunction(dynamoDbDocumentClient.scan)).toBeTruthy();
    expect(jest.isMockFunction(dynamoDbDocumentClient.query)).toBeTruthy();
    expect(jest.isMockFunction(dynamoDbDocumentClient.update)).toBeTruthy();
    expect(jest.isMockFunction(ssm.getParameter)).toBeTruthy();
  });

  // test 1
  it('handler should be failed when content is not JSON.', async () => {
    const response = await handler(mockRequest.test1Event);
    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test1Response);
  });

  // test 2
  it('handler should be failed when walletName and refreshToken is missing', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockRequest.test2Event.body),
      headers: mockRequest.test2Event.headers,
    };
    const response = await handler(event);
    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test2Response);
  });

  // test 3
  it('handler should be failed when userId is not found', async () => {
    verifyRefreshTokenSpy.mockReturnValueOnce(
      Promise.resolve({
        userId: 'testUserId',
        walletId: 'test',
        walletName: mockRequest.test3Event.body.walletName,
      }),
    );
    utilsDynamoDbQuerySpy.mockResolvedValueOnce(
      Promise.resolve({
        Items: ['test'],
      }),
    ).mockResolvedValueOnce(
      Promise.resolve(undefined),
    );
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockRequest.test3Event.body),
      headers: mockRequest.test3Event.headers,
    };
    const response = await handler(event);
    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test3Response);
  });

  // test 4
  it('handler should success when correct walletName and refreshToken is provided', async () => {
    verifyRefreshTokenSpy.mockReturnValueOnce(
      Promise.resolve({
        userId: 'testUserId',
        walletId: 'test',
        walletName: mockRequest.test3Event.body.walletName,
      }),
    );
    utilsDynamoDbQuerySpy.mockResolvedValueOnce(
      Promise.resolve({
        Items: ['test'],
      }),
    ).mockResolvedValueOnce(
      Promise.resolve({
        count: 1,
      }),
    );
    getAuthResponseSpy.mockResolvedValueOnce(
      Promise.resolve({
        jwtAccessToken: 'jwtAccessTokenTestValue',
        jwtRefreshToken: 'jwtRefreshTokenTestValue',
      }),
    );
    getSecretSpy.mockResolvedValueOnce(
      Promise.resolve(JSON.stringify({
        PUBLIC_KEY_ID: 'PUBLIC_KEY_ID_TEST_VALUE',
        PRIVATE_KEY: 'PRIVATE_KEY_TEST_VALUE',
      })),
    );
    getSignedCookiesSpy.mockImplementationOnce(() => ({
      'CloudFront-Policy': 'CloudFront-Policy_TEST_VALUE',
      'CloudFront-Signature': 'CloudFront-Signature_TEST_VALUE',
      'CloudFront-Key-Pair-Id': 'CloudFront-Key-Pair-Id_TEST_VALUE',
    }));
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockRequest.test3Event.body),
      headers: mockRequest.test3Event.headers,
    };
    const response = await handler(event);
    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(sm.getSecret).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toEqual(mockResponse.test4Response.statusCode);
    expect(response).toEqual(mockResponse.test4Response);
  });
});
