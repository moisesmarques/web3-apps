const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../get');
const utils = require('../../../utils');

const transactionId = '1Fv8nP6F_EIe7_6JeWwa0';
describe('Test get', () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
  });

  // Clean up mocks
  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should fail when transactionId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      headers: {},
    };

    const result = await lambda.main(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Missing transactionId path param',
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail when InternalServerError', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.reject({ Item: undefined }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        transactionId,
      },
      headers: {},
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: `Error retrieving transaction ${transactionId}`,
    });

    console.log(result);
    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should pass when no transaction is found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        transactionId,
      },
      headers: {},
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Transaction not found',
    });

    console.log(result);
    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should pass when correct transactionId is passed', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        transactionId,
      },
      headers: {},
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'Transaction retrieved successfully.',
    });

    console.log(result);
    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });
});
