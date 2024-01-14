const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const lambda = require('../../../../create');
const { send } = require('../../../../utils');
const mockData = require('./mock/request.json');

// const dynamoDbDocumentClient = new dynamodb.DocumentClient();

describe('Test view', () => {
  let putSpy;

  beforeAll(() => {
    putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => mockData.jwtMock);
  });

  // Clean up mocks
  afterAll(() => {
    putSpy.mockRestore();
    sinon.restore();
  });

  // Test 1 - Passed
  it('should fail when Auth token is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = send(
      StatusCodes.UNAUTHORIZED,
      { message: 'invalid token' },
    );

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  // Test 2
  it('should fail when AuthToken is invalid', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: {
        authorization: mockData.AuthCode1,
      },
    };

    const result = await lambda.handler(event);

    const expectedResult = send(
      StatusCodes.UNAUTHORIZED,
      { message: 'invalid token' },
    );

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail with invalid payload', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({}),
      headers: {
        authorization: mockData.AuthCode,
      },
    };
    const result = await lambda.handler(event);

    const expectedResult = send(
      StatusCodes.BAD_REQUEST,
      { message: 'One or more fields are invalid.' },
    );
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should pass with valid payload', async () => {
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockData.appCategoryData),
      headers: {
        authorization: mockData.AuthCode,
      },
    };
    const result = await lambda.handler(event);

    const expectedResult = send(
      StatusCodes.CREATED,
      { message: 'App Category created successfully.' },
    );
    expect(result.statusCode).toEqual(expectedResult.statusCode);
    expect(result.message).toEqual(expectedResult.message);
  });

  it('should fail with InternalServerError', async () => {
    putSpy.mockReturnValue({
      promise: () => Promise.reject({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockData.appCategoryData),
      headers: {
        authorization: mockData.AuthCode,
      },
    };
    const result = await lambda.handler(event);

    const expectedResult = send(
      StatusCodes.INTERNAL_SERVER_ERROR,
      { message: 'App Category created successfully.' },
    );
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });
});
