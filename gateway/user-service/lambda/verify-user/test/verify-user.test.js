const axios = require('axios');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const mockRequest = require('./mock/request.json');
const mockResponse = require('./mock/response.json');
const { handler } = require('../index');
const Utils = require('../../../utils');

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

const ssm = new AWS.SSM();
const dynamoDbDocumentClient = new AWS.DynamoDB.DocumentClient();

describe('Calling Verify User Handler To Test', () => {
  const OLD_ENV = process.env;
  let scanSpy;
  afterAll(() => {
    jest.resetAllMocks();
    scanSpy.mockRestore();
    process.env = OLD_ENV;
  });

  beforeAll(() => {
    process.env = { ...OLD_ENV };
    scanSpy = jest.spyOn(Utils.dynamoDb, 'scan');
    dynamoDbDocumentClient.get().promise.mockResolvedValue({ Item: '' }); //
    dynamoDbDocumentClient.query().promise.mockResolvedValue({ Count: 0 });
    dynamoDbDocumentClient.update().promise.mockResolvedValue(mockResponse.dynamodbUpdateResponse);
    ssm.getParameter().promise.mockResolvedValue(mockResponse.ssmGetParamResponse);//
    axios.get.mockResolvedValue(mockResponse.axiosGetResponse);
    jwt.sign.mockResolvedValue(mockResponse.jwtToken);
  });

  it('should be mocked successfully', async () => {
    expect(jest.isMockFunction(dynamoDbDocumentClient.get)).toBeTruthy();
    expect(jest.isMockFunction(dynamoDbDocumentClient.query)).toBeTruthy();
    expect(jest.isMockFunction(dynamoDbDocumentClient.update)).toBeTruthy();
    expect(jest.isMockFunction(ssm.getParameter)).toBeTruthy();
  });

  // test 1
  it('handler should be failed when required parameters is missing', async () => {
    mockRequest.test1Event.body = JSON.stringify(mockRequest.test1Event.body);
    const response = await handler(mockRequest.test1Event);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test1Response);
  });

  // test 2
  it('handler should be failed when account ID not exist', async () => {
    mockRequest.test2Event.body = JSON.stringify(mockRequest.test2Event.body);
    axios.get.mockRejectedValue(mockResponse.axiosGetErrorResponse);

    const response = await handler(mockRequest.test2Event);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test2Response);
  });

  // test 3
  it('handler should be failed when invalid account ID/OTP', async () => {
    dynamoDbDocumentClient.query().promise.mockResolvedValue(mockResponse.dynamodbQueryResponse);
    mockRequest.test3Event.body = JSON.stringify(mockRequest.test3Event.body);

    const response = await handler(mockRequest.test3Event);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test3Response);
  });

  // test 4
  it('handler should be failed when OTP expired', async () => {
    scanSpy.mockImplementation(() => mockResponse.dynamodbScanErrorResponse);
    mockRequest.test4Event.body = JSON.stringify(mockRequest.test4Event.body);

    const response = await handler(mockRequest.test4Event);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test4Response);
  });

  // test 5
  it('handler should be called successfully', async () => {
    scanSpy.mockImplementation(() => mockResponse.dynamodbScanResponse);
    mockResponse.dynamodbScanResponse[0].created = Date.now();
    process.env.OTP_EXPIRY_IN_SECONDS = 900;
    process.env.REFRESH_TOKEN_EXPIRY_IN_MILLISECONDS = '30d';
    process.env.TOKEN_EXPIRY_IN_MILLISECONDS = '1d';
    mockRequest.test5Event.body = JSON.stringify(mockRequest.test5Event.body);

    const response = await handler(mockRequest.test5Event);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test5Response);
  });
});
