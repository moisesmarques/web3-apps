const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../update');
const utils = require('../../../utils');

// const userId = "zuldOZC9PulfCWXeGix7L";
describe('Test view', () => {
  let getSpy;
  let updateSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
  });

  // Clean up mocks
  afterAll(() => {
    getSpy.mockRestore();
    updateSpy.mockRestore();
  });

  it('should fail when userId is missing', async () => {
    const event = {
      httpMethod: 'PUT',
      pathParameters: {},
      headers: {
        Authorization: null,
      },
      body: '{"firstName": "Manish","profilePhoto": "file.apiserver.display_photo.png","lastName": "Saraswat","email": "manishprimelab@gmail.com","phone": "9749446545","countryCode": "+91"}',
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "userId" is required.',
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });
  it('should fail when validation does not match', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });
    const event = {
      httpMethod: 'PUT',
      pathParameters: {
        userId: 'zuldOZC9PulfCWXeGix7L',
      },
      headers: {
        Authorization: null,
      },
      body: '{"firstName": "","profilePhoto": "file.apiserver.display_photo.png","lastName": "Saraswat","email": "manishprimelab@gmail.com","phone": "9749446545","countryCode": "+91"}',
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid.',
    });
    // Compare the result with the expected result
    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when userId does not exist', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });
    const event = {
      httpMethod: 'PUT',
      pathParameters: {
        userId: '123',
      },
      headers: {
        Authorization: null,
      },
      body: '{"firstName": "Manish","profilePhoto": "file.apiserver.display_photo.png","lastName": "Saraswat","email": "manishprimelab@gmail.com","phone": "9749446545","countryCode": "+91"}',
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'User not found for userId: 123 !',
    });
      // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });
  it('should update profile by userId', async () => {
    const item = { message: 'User detail updated successfully!' };

    // Return the specified value whenever the spied function is called
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: item }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: item }),
    });

    const event = {
      httpMethod: 'PUT',
      pathParameters: {
        userId: 'zuldOZC9PulfCWXeGix7L',
      },
      headers: {
        Authorization: null,
      },
      body: '{"firstName": "Manish","profilePhoto": "file.apiserver.display_photo.png","lastName": "Saraswat","email": "manishprimelab@gmail.com","phone": "9749446545","countryCode": "+91"}',
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.OK, item);
    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });
});
