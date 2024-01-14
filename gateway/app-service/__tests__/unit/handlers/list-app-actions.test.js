const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const { result } = require('lodash');
const lambda = require('../../../list-app-actions');
const utils = require('../../../utils');

const Authorization = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJWMVN0R1hSOF9aNjVkSGk2Qi1teVQiLCJmaXJzdE5hbWUiOiJ0ZXN0IiwibGFzdE5hbWUiOiJ1c2VyIiwid2FsbGV0SWQiOiJ3YWZnZXNoLm5lYXIiLCJlbWFpbCI6Im1vY2stdGVzdEBwcmltZWxhYi5pbyIsInBob25lIjoiKzI1NTE4MTcxODEiLCJkb2IiOiIyMDAwLTEwLTEwIn0.SIF6-9zZVldAqsMi0fb_UgiaHmRd8h7HN3tBmcf-SAI';
// const Authorization =
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkIjoxNjQ2MzAzMzgzNzM1LCJzdGF0dXMiOiJhY3RpdmUiLCJpc1Bob25lVmVyaWZpZWQiOmZhbHNlLCJpc0VtYWlsVmVyaWZpZWQiOmZhbHNlLCJlbWFpbCI6InRlc3Rmb3JpdmFuQGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6IlRlc3QiLCJsYXN0TmFtZSI6Ikl2YW4iLCJ1c2VySWQiOiJWMVN0R1hSOF9aNjVkSGk2Qi1teVQiLCJ3YWxsZXROYW1lIjoidGVzdGZvcml2YW4ubmVhciIsImlhdCI6MTY0NjMwMzM4M30.SuOtqyIW76ZY3_Y3ijWuPPcZ5gGDz1wWgTgPL8H4E6o';
describe('Test app actions list', () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
  });

  /** * Clean up mocks ** */
  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should pass when search result exist', async () => {
    const item = {
      appId: '12XCAAASHHAJ23JS',
      actionId: '12XCAAASHHAJ23JS',
      status: 'Active',
      created: 1641355923848,
      updated: 1641355923848,
    };
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [item] }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        appId: '12XCAAASHHAJ23JS',
      },
      headers: {
        Authorization,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      success: true,
      message: 'App actions retrieved successfully',
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should fail when no search result found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        appId: 'KYCApp123',
      },
      headers: {
        Authorization,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });
  it('should fail when no search result found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        appId: 'KYCApp123',
      },
      headers: {
        Authorization,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should fail when no appId input provided', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {},
      pathParameters: {},
      headers: {
        Authorization,
      },
    };
    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "appId" is required.',
    });
    expect(result).toEqual(expectedResult);
  });
  it('should fail with internal server error', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.reject('something went wrong'),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        appId: 'KYCApp123',
      },
      headers: {
        Authorization,
      },
    };
    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error to get app actions!',
    });
    expect(result).toEqual(expectedResult);
  });
});
