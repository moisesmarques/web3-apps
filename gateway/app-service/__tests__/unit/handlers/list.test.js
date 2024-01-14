const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const lambda = require('../../../list');
const utils = require('../../../utils');

const Authorization = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkIjoxNjQ2MzAzMzgzNzM1LCJzdGF0dXMiOiJhY3RpdmUiLCJpc1Bob25lVmVyaWZpZWQiOmZhbHNlLCJpc0VtYWlsVmVyaWZpZWQiOmZhbHNlLCJlbWFpbCI6InRlc3Rmb3JpdmFuQGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6IlRlc3QiLCJsYXN0TmFtZSI6Ikl2YW4iLCJ1c2VySWQiOiJWMVN0R1hSOF9aNjVkSGk2Qi1teVQiLCJ3YWxsZXROYW1lIjoidGVzdGZvcml2YW4ubmVhciIsImlhdCI6MTY0NjMwMzM4M30.SuOtqyIW76ZY3_Y3ijWuPPcZ5gGDz1wWgTgPL8H4E6o';
describe('Test app service list', () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'scan');
  });

  /** * Clean up mocks ** */
  afterAll(() => {
    getSpy.mockRestore();
  });

  process.env.TABLE_NEAR_APPS = 'near-apps';
  it('should pass when search result exist', async () => {
    const item = {
      appId: '12XCAAASHHAJ23JS',
      categoryId: '12XCAAASHHAJ23JS',
      name: 'KYC App 123',
      description: 'test description',
      tags: ['a', 'b'],
      status: 'Active',
      created: 1641355923848,
      updated: 1641355923848,
    };

    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [item] }),
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        search: 'KYCApp123',
      },
      headers: {
        Authorization,
      },
    };

    const actualResult = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      success: true,
      message: 'App retrieved successfully!',
      data: item,
    });
    expect(JSON.parse(actualResult.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when no search result found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }),
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        search: 'KYCApp123',
      },
      headers: {
        Authorization,
      },
    };

    const actualResult = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      errors: [{
        message: 'unable to find the app',
      }],
    });
    expect(JSON.parse(actualResult.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when no search result input provided', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }),
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: {},
      headers: {
        Authorization,
      },
    };
    const actualResult = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error to get apps!',

    });
    expect(JSON.parse(actualResult.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when any error occurs', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.reject({ Items: [] }),
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        search: 'test',
      },
      headers: {
        Authorization,
      },
    };
    const actualResult = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error to get apps!',
    });
    expect(JSON.parse(actualResult.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });
  it('should fail when no search doesnot follow the pattern', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        search: '????',
      },
      headers: {
        Authorization,
      },
    };

    const actualResult = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: [{
        appName: 'Invalid search input received',
      }],
    });
    expect(actualResult).toEqual(expectedResult);
  });
  it('should fail when no search found', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {
        Authorization,
      },
    };

    const actualResult = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {

    });
    expect(actualResult.statusCode).toEqual(expectedResult.statusCode);
  });
});
