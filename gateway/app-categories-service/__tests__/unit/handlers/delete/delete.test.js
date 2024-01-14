const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const lambda = require('../../../../delete');
const { send } = require('../../../../utils');
const mockData = require('./mock/request.json');
const mockResponse = require('./mock/response.json');

describe('Delete App Category Test Cases', () => {
  let updateSpy;

  beforeAll(() => {
    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => mockData.jwtMock);
  });

  afterAll(() => {
    updateSpy.mockRestore();
    sinon.restore();
  });

  it('should fail when categoryId is missing in path parameters', async () => {
    const event = {
      httpMethod: 'delete',
      pathParameters: {
      },
      headers: {
        authorization: mockData.AuthCode,
      },
      body: JSON.stringify({}),
    };
    const result = await lambda.handler(event);
    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "categoryId" is required.',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when Auth token is missing', async () => {
    const event = {
      httpMethod: 'delete',
      body: JSON.stringify({}),
      pathParameters: {
        categoryId: '123423443',
      },
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = send(StatusCodes.UNAUTHORIZED, {
      message: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass when delete App Category successfully', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mockData.appCategoryData }),
    });
    const event = {
      httpMethod: 'delete',
      body: JSON.stringify({}),
      headers: {
        Authorization: mockData.AuthCode,
      },
      pathParameters: {
        categoryId: '123423443',
      },
    };
    const result = await lambda.handler(event);
    expect(result.body.message).toEqual(mockResponse.body.message);
    expect(result.statusCode).toEqual(mockResponse.statusCode);
  });

  it('should pass when delete App Category successfully', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.reject({ Item: mockData.appCategoryData }),
    });
    const event = {
      httpMethod: 'delete',
      body: JSON.stringify({}),
      headers: {
        Authorization: mockData.AuthCode,
      },
      pathParameters: {
        categoryId: '123423443',
      },
    };
    const result = await lambda.handler(event);
    expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should fail when jwt is not valid', async () => {
    sinon.restore();
    const event = {
      httpMethod: 'delete',
      body: JSON.stringify(mockData.appCategoryData),
      headers: {
        Authorization: 'myToken',
      },
      pathParameters: {
        categoryId: '123423443',
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = send(StatusCodes.UNAUTHORIZED, {
      message: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });
});
