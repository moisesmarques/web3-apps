const axios = require('axios');
const AWS = require('aws-sdk');
const mockRequest = require('./mock/request.json');
const mockResponse = require('./mock/response.json');
const { handler } = require('../index');

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

const ssm = new AWS.SSM();
const dynamoDbDocumentClient = new AWS.DynamoDB.DocumentClient();

describe('Calling Update User Handler To Test', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  beforeAll(() => {
    dynamoDbDocumentClient.get().promise.mockResolvedValue({ Item: '' });
    dynamoDbDocumentClient.query().promise.mockResolvedValue(mockResponse.dynamodbQueryResponse);
    dynamoDbDocumentClient.update().promise.mockResolvedValue(mockResponse.dynamodbUpdateResponse);
    ssm.getParameter().promise.mockResolvedValue(mockResponse.ssmGetParamResponse);
    axios.get.mockResolvedValue(mockResponse.axiosGetResponse);
  });

  it('should be mocked successfully', async () => {
    expect(jest.isMockFunction(dynamoDbDocumentClient.get)).toBeTruthy();
    expect(jest.isMockFunction(dynamoDbDocumentClient.query)).toBeTruthy();
    expect(jest.isMockFunction(dynamoDbDocumentClient.update)).toBeTruthy();
    expect(jest.isMockFunction(ssm.getParameter)).toBeTruthy();
  });

  // test 1
  it('handler should be failed when userId and authorization is missing', async () => {
    const response = await handler(mockRequest.test1Event);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test1Response);
  });

  // test 2
  it('handler should be failed when userId is login', async () => {
    const response = await handler(mockRequest.test2Event);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test2Response);
  });

  // test 3
  it('handler should be failed when token is empty', async () => {
    const response = await handler(mockRequest.test3Event);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test3Response);
  });

  // test 4
  it('handler should be failed when userId invalid', async () => {
    mockRequest.test4Event.body = JSON.stringify(mockRequest.test4Event.body);

    const response = await handler(mockRequest.test4Event);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test4Response);
  });

  // test 5
  it('handler should be failed when email already exist', async () => {
    dynamoDbDocumentClient.get().promise.mockResolvedValue(mockResponse.dynamodGetResponse);
    mockRequest.test5Event.body = JSON.stringify(mockRequest.test5Event.body);

    const response = await handler(mockRequest.test5Event);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test5Response);
  });

  // test 6
  it('handler should be failed when phone already exist', async () => {
    mockRequest.test6Event.body = JSON.stringify(mockRequest.test6Event.body);

    const response = await handler(mockRequest.test6Event);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test6Response);
  });

  // test 7
  it('handler should be called successfully', async () => {
    mockRequest.test7Event.body = JSON.stringify(mockRequest.test7Event.body);
    dynamoDbDocumentClient.query().promise.mockResolvedValue({ Count: 0 });

    const response = await handler(mockRequest.test7Event);

    expect(response).toBeDefined();
    expect(response).not.toBeNull();
    expect(response).toEqual(mockResponse.test7Response);
  });
});
