const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const lambda = require('../../../details');
const utils = require('../../../utils');
const { send } = require('../../../utils');

const jestEnvMock = require('../../../.jest/mock/environment.json');
const jestHeaderMock = require('../../../.jest/mock/headers.json');
const jestContactMock = require('../../../.jest/mock/contact.json');
const jestJwtMock = require('../../../.jest/mock/jwt.json');

describe('Test contact service details lambda', () => {
  let getSpy;
  const OLD_ENV = process.env;

  beforeAll(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => jestJwtMock.jwtMock);
  });
  /** * Clean up mocks ** */
  afterAll(() => {
    getSpy.mockRestore();
    process.env = OLD_ENV;
  });

  it('should pass when contact exist', async () => {
    process.env.SECRET_KEY = 'SECRET_KEY';
    const item = jestContactMock.contactDetail;

    getSpy.mockReturnValue({
      promise: () => Promise.resolve(item),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        contactId: jestEnvMock.contactId,
      },
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
    };

    const actualResult = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'Contact detail retrieved successfully!',
      data: item,
    });
    expect(actualResult).toEqual(expectedResult);
  });

  it('should fail when contact does not exist', async () => {
    process.env.SECRET_KEY = 'SECRET_KEY';
    const item = {};

    getSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        contactId: jestEnvMock.contactId,
      },
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
    };

    const actualResult = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `Contact detail not found for contactId: ${jestEnvMock.contactId} !`,
      data: item,
    });
    expect(actualResult).toEqual(expectedResult);
  });

  it('should fail when Auth token is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        contactId: jestEnvMock.contactId,
      },
      headers: {},
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.UNAUTHORIZED, {
      message: 'Access Token is required.',
    });
    expect(result).toEqual(expectedResult);
  });
  it('should fail when contactId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
      },
      headers: {},
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "contactId" is required.',
    });
    expect(result).toEqual(expectedResult);
  });
});
