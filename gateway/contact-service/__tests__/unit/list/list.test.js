const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const lambda = require('../../../list');
const utils = require('../../../utils');

const jestHeaderMock = require('../../../.jest/mock/headers.json');
const jestContactMock = require('../../../.jest/mock/contact.json');
const jestJwtMock = require('../../../.jest/mock/jwt.json');

const Authorization = jestHeaderMock.AuthCode;

describe('Test contact service list', () => {
  let getSpy;
  const OLD_ENV = process.env;
  let jwtSpy;

  beforeAll(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
    jwtSpy = jest.spyOn(jwt, 'verify');
    jwtSpy.mockReturnValue(jestJwtMock.jwtMock);
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => jestJwtMock.jwtMock);
  });

  afterAll(() => {
    jwtSpy.mockReturnValue(jestJwtMock.jwtMock);
    getSpy.mockRestore();
  });

  /** * Clean up mocks ** */
  afterAll(() => {
    getSpy.mockRestore();
    process.env = OLD_ENV;
  });

  it('should pass when contact list exist', async () => {
    process.env.SECRET_KEY = 'SECRET_KEY';

    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [jestContactMock.contactDetail, jestContactMock.contactDetail1] }),
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
      message: 'Contact list retrieved successfully!',
      data: [jestContactMock.contactDetail, jestContactMock.contactDetail1],
    });
    expect(actualResult).toEqual(expectedResult);
  });

  it('should fail when InternalServerError', async () => {
    process.env.SECRET_KEY = 'SECRET_KEY';
    const item = jestContactMock.contactDetail;

    getSpy.mockReturnValue({
      promise: () => Promise.reject({ Items: [item] }),
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
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error to get contact detail!',
    });
    expect(actualResult).toEqual(expectedResult);
  });

  it('should fail when no token provided', async () => {
    jwtSpy.mockRestore();
    jwtSpy.mockReturnValue(jestJwtMock.jwtMock);
    process.env.SECRET_KEY = 'SECRET_KEY';
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }),
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: {},
      headers: {
      },
    };
    const actualResult = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Access Token is required.',
    });
    expect(actualResult).toEqual(expectedResult);
  });

  it('should fail when no userId found', async () => {
    sinon.restore();
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => jestJwtMock.jwtWithouUser);
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {},
      headers: {
        Authorization: 'myToken',
      },
    };
    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "userId" is required.',
    });
    expect(result).toEqual(expectedResult);
  });
});
