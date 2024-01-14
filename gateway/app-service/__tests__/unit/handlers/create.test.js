const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const lambda = require('../../../create');
const utils = require('../../../utils');
const mockResponse = require('../../mock/response.json');

const Authorization = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMlhDQUFBU0hIQUoyM0pTIiwiTmFtZSI6InRlc3QgdXNlciJ9.ULLSU4UFYWTLmc5-RHNECk1vWyq_LHs6CVMsL_rMMAg';

describe('Test app create service', () => {
  let getSpy;
  const OLD_ENV = process.env;
  let jwtSpy;

  beforeAll(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    jwtSpy = jest.spyOn(jwt, 'verify');
    jwtSpy.mockReturnValue(mockResponse.response[1]);
  });

  afterEach(() => {
    jwtSpy.mockReturnValue(mockResponse.response[0]);
  });

  /** * Clean up mocks ** */
  afterAll(() => {
    getSpy.mockRestore();
    process.env = OLD_ENV;
  });

  it('should fail when required input does not provided as input', async () => {
    process.env.SECRET_KEY = 'SECRET_KEY';
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      headers: {
        Authorization,
      },
      body: '{}',
    };

    const actualResult = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['"ownerId" is required', '"categoryId" is required', '"appName" is required', '"description" is required', '"tags" is required', '"version" is required', '"developer" is required'],
    });
    expect(JSON.parse(actualResult.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when categoryId is invalid', async () => {
    process.env.SECRET_KEY = 'SECRET_KEY';
    getSpy.mockReturnValue({
      promise: () => Promise.reject({
        appId: '12XCAAASHHAJ23JS', ownerId: '12XCAAASHHAJ23JS', categoryId: 'V1StGXR8_Z5jdHi6B-myT', appName: 'test app', description: 'test description', tags: ['1', '2'], version: '0.1', developer: '', created: '2022-02-24T21:54:30', updated: '2022-02-24T21:54:30',
      }),
    });

    const event = {
      httpMethod: 'GET',
      headers: {
        Authorization,
      },
      body: '{"ownerId":"12XCAAASHHAJ23JS","categoryId":"V1StGXR8_Z5jdHi6B-myT","appName":"test app","description":"test description","tags":["1","2"],"version":"0.1","developer":"djjd"}',
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      success: false,

    });
    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should pass when required input provided in request', async () => {
    process.env.SECRET_KEY = 'SECRET_KEY';
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({
        appId: '12XCAAASHHAJ23JS', ownerId: '12XCAAASHHAJ23JS', categoryId: 'V1StGXR8_Z5jdHi6B-myT', appName: 'test app', description: 'test description', tags: ['1', '2'], version: '0.1', developer: '', created: '2022-02-24T21:54:30', updated: '2022-02-24T21:54:30',
      }),
    });
    const app = {
      appIcon: 'https://google.com', overview: 'efrfrg', appUrl: 'https://google.com', ownerId: '12XCAAASHHAJ23JS', categoryId: 'V1StGXR8_Z5jdHi6B-myT', appName: 'test app', description: 'test description', tags: ['1', '2'], version: '0.1', developer: 'djjd',
    };
    const event = {
      httpMethod: 'GET',
      headers: {
        Authorization,
      },
      body: JSON.stringify(app),
    };

    const result = await lambda.main(event);
    console.log(result);
    const expectedResult = utils.send(StatusCodes.CREATED, {
      success: true,
      message: 'App successfully created!',
      data: app,
    });
    const actualResult = await lambda.main(event);
    expect(actualResult.statusCode).toEqual(expectedResult.statusCode);
  });
  it('should fail when error ', async () => {
    process.env.SECRET_KEY = 'SECRET_KEY';
    getSpy.mockReturnValue({
      promise: () => Promise.reject('something went wrong'),
    });
    const app = {
      appIcon: 'https://google.com', overview: 'efrfrg', appUrl: 'https://google.com', ownerId: '12XCAAASHHAJ23JS', categoryId: 'V1StGXR8_Z5jdHi6B-myT', appName: 'test app', description: 'test description', tags: ['1', '2'], version: '0.1', developer: 'djjd',
    };
    const event = {
      httpMethod: 'GET',
      headers: {
        Authorization,
      },
      body: JSON.stringify(app),
    };

    const result = await lambda.main(event);
    console.log(result);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
    });
    const actualResult = await lambda.main(event);
    expect(actualResult.statusCode).toEqual(expectedResult.statusCode);
  });
});
