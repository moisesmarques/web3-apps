const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../index.js');
const http = require('../../../src/lib/http');

const dynamoDbDocumentClient = new dynamodb.DocumentClient();

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
  it('should fail when input is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      headers: {},
    };

    const result = await lambda.handler(event);

    const expectedResult = http.send(
      StatusCodes.INTERNAL_SERVER_ERROR,
      { message: 'Unexpected token u in JSON at position 0' },
    );

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });
});
