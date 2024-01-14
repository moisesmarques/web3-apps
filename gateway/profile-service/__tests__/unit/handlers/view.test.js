const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../view');
const utils = require('../../../utils');

const userId = 'zuldOZC9PulfCWXeGix7L';
describe('Test view', () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
  });

  // Clean up mocks
  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should fail when userId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      headers: {},
    };

    const result = await lambda.main(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter \"userId\" is required.',
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail when userId does not exist', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        userId: '123',
      },
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'User detail not found for userId: 123 !',
      data: {},
    });
    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });
  it('should get profile by userId', async () => {
    const item = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: '{"message":"User detail retrieved successfully!","data":{"Item":{"lastName":"Saraswat","userId":"zuldOZC9PulfCWXeGix7L","status":"active","created":1647254053326,"isPhoneVerified":false,"email":"manishprimelab@gmail.com","firstName":"Manish","isEmailVerified":false}}}',
    };

    // Return the specified value whenever the spied get function is called
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: item }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        userId,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.OK, item);
    // Compare the result with the expected result
    expect(JSON.parse(result.body).data.Item.body).toEqual(JSON.parse(expectedResult.body).body);
  });
});
