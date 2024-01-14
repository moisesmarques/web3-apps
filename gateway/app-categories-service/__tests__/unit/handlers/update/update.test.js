const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const lambda = require('../../../../update');
const { send } = require('../../../../utils');
const mockData = require('./mock/request.json');
const mockResponse = require('./mock/response.json');

describe('Update App Category Test Cases', () => {
  let updateSpy;

  beforeAll(() => {
    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => mockData.jwtMock);
  });

  afterAll(() => {
    updateSpy.mockRestore();
  });

  it('should fail when categoryId is missing in path parameters', async () => {
    const event = {
      httpMethod: 'PUT',
      pathParameters: {
      },
      headers: {
        authorization: mockData.AuthCode,
      },
      body: JSON.stringify({
        name: 'Gaming',
      }),
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "categoryId" is required.',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when Auth token is missing', async () => {
    const event = {
      httpMethod: 'PUT',
      body: JSON.stringify(mockData.appCategoryData),
      pathParameters: {
        categoryId: '123423443',
      },
      headers: {},
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error updating App Category!',
      data: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when update is not successful', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.reject('Something Went Wrong'),
    });

    const event = {
      httpMethod: 'PUT',
      body: JSON.stringify(mockData.appCategoryData),
      pathParameters: {
        categoryId: '123423443',
      },
      headers: {
        Authorization: mockData.AuthCode,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error updating App Category!',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when App Category schema is not valid', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.reject({ code: 'ConditionalCheckFailedException' }),
    });
    const event = {
      httpMethod: 'PUT',
      body: JSON.stringify(mockData.appCategoryData),
      pathParameters: {
        categoryId: '123423443',
      },
      headers: {
        Authorization: mockData.AuthCode,
      },
    };

    const result = await lambda.main(event);
    console.log(result);
    const expectedResult = send(StatusCodes.NOT_FOUND, {
      message: 'Error updating App Category. categoryId: 123423443 not found!',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when App Category schema is not valid', async () => {
    const event = {
      httpMethod: 'PUT',
      body: JSON.stringify(mockData.appCategoryInvalid),
      pathParameters: {
        categoryId: '123423443',
      },
      headers: {
        Authorization: mockData.AuthCode,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.BAD_REQUEST, {
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should pass when update App Category successfully', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mockData.appCategoryData }),
    });
    const event = {
      httpMethod: 'PUT',
      body: JSON.stringify(mockData.appCategoryData),
      headers: {
        Authorization: mockData.AuthCode,
      },
      pathParameters: {
        categoryId: '123423443',
      },
    };
    const result = await lambda.main(event);
    expect(result.body.message).toEqual(mockResponse.body.message);
    expect(result.statusCode).toEqual(mockResponse.statusCode);
  });

  it('should fail when jwt is not valid', async () => {
    sinon.restore();
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockData.appCategoryData),
      headers: {
        Authorization: 'myToken',
      },
      pathParameters: {
        categoryId: '123423443',
      },
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error updating App Category!',
      data: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });
});
