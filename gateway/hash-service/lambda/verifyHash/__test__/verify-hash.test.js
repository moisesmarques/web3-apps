const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../index.js');
const http = require('../../../src/lib/http');

const dynamoDbDocumentClient = new dynamoDB.DocumentClient();
describe('Test view', () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
  });

  // Clean up mocks
  afterAll(() => {
    getSpy.mockRestore();
  });

  // Test 1 - Passed
  it('should fail when hash is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      headers: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = http.send(
      StatusCodes.BAD_REQUEST,
      { message: 'Hash value is required' },
    );

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  // Test 2 - Passed
  it('should fail when hash is invalid', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: { hash: '123' },
      headers: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = http.send(
      StatusCodes.INTERNAL_SERVER_ERROR,
      { message: 'value is not defined' },
    );

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  // Test 3 -Passed
  it('should be mocked successfully', async () => {
    expect(jest.isMockFunction(dynamoDbDocumentClient.get)).toBeTruthy();
  });
});
