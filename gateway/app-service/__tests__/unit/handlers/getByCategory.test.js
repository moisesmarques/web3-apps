const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const utils = require('../../../utils');
const lambda = require('../../../getByCategory');

const AuthCode = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJWMVN0R1hSOF9aNjVkSGk2Qi1teVQiLCJmaXJzdE5hbWUiOiJ0ZXN0IiwibGFzdE5hbWUiOiJ1c2VyIiwid2FsbGV0SWQiOiJ3YWZnZXNoLm5lYXIiLCJlbWFpbCI6Im1vY2stdGVzdEBwcmltZWxhYi5pbyIsInBob25lIjoiKzI1NTE4MTcxODEiLCJkb2IiOiIyMDAwLTEwLTEwIn0.SIF6-9zZVldAqsMi0fb_UgiaHmRd8h7HN3tBmcf-SAI';
const categoryId = 'DGWS4dPa8dejsDNMMlwzg';
const categoryId1 = 'V1StGXR8_Z5jdHi6B-myT';

describe('Test getByCategory test case', () => {
  let verifyAccessTokenSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
    verifyAccessTokenSpy = jest.spyOn(utils, 'verifyAccessToken');
  });

  // Clean up mocks
  afterAll(() => {
    verifyAccessTokenSpy.mockRestore();
    getSpy.mockRestore();
  });

  it('should fail when token is missing', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        search: categoryId1,
      },
      headers: {},
    };
    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error in getting Apps!',
      data: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when categoryId is missing on query param', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve('yes'),
    });
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {},
      headers: { Authorization: AuthCode },
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: [{ categoryId: 'Missing/Invalid categoryId query parameter' }],
    });
    expect(result).toEqual(expectedResult);
  });
  it('should fail when queryparam is missing', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve('yes'),
    });
    const event = {
      httpMethod: 'GET',
      headers: { Authorization: AuthCode },
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: [{ categoryId: 'Missing/Invalid categoryId query parameter' }],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when InternlError', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve('yes'),
    });
    const Item = {
      appName: 'Test app',
      created: 1647883665963,
      appId: 'ludAfimmXf3Le9fojIFO9',
      description: 'Test description',
      developer: 'eshwar',
      ownerId: '147782bc-3124-451f-9f57-ba1f3d731807',
      version: '3',
      updated: 1647883665963,
      categoryId: 'V1StGXR8_Z5jdHi6B-myT',
      tags: [
        'tag1',
        'tag2',
      ],
    };

    getSpy.mockReturnValue({
      promise: () => Promise.reject({ Items: [Item] }),
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: { search: categoryId1 },
      headers: {},
    };

    const result = await lambda.main(event);
    console.log(result);
    expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should pass when categoryId is present on query param', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve('yes'),
    });
    const Item = {
      appName: 'Test app',
      created: 1647883665963,
      appId: 'ludAfimmXf3Le9fojIFO9',
      description: 'Test description',
      developer: 'eshwar',
      ownerId: '147782bc-3124-451f-9f57-ba1f3d731807',
      version: '3',
      updated: 1647883665963,
      categoryId: 'V1StGXR8_Z5jdHi6B-myT',
      tags: [
        'tag1',
        'tag2',
      ],
    };

    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [Item] }),
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: { search: categoryId1 },
      headers: {},
    };

    const result = await lambda.main(event);
    console.log(result);
    expect(result.statusCode).toEqual(StatusCodes.OK);
  });
  it('should pass when categoryId is present on query param', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve('yes'),
    });
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: { search: categoryId1 },
      headers: {},
    };

    const result = await lambda.main(event);
    console.log(result);
    expect(result.statusCode).toEqual(StatusCodes.OK);
  });
});
