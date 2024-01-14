const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const lambda = require('../../../photo');
const { send } = require('../../../utils');

const jestEnvMock = require('../../../.jest/mock/environment.json');
const jestHeaderMock = require('../../../.jest/mock/headers.json');
const jestContactMock = require('../../../.jest/mock/contact.json');
const jestJwtMock = require('../../../.jest/mock/jwt.json');

describe('Photo Contact Test Case', () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => jestJwtMock.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should fail when contactId is missing in path parameters', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
      },
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);

    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "contactId" is required.',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when Auth token is missing', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
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

  it('should fail when contactId data not found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve(undefined),
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

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.NOT_FOUND, {
      message: `Contact not found for contactId: ${jestEnvMock.contactId} !`,
      data: {},
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass when successfully retrieved photo contact', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: jestContactMock.contactData }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        userId: jestEnvMock.userId,
        contactId: jestEnvMock.contactId,
      },
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.OK, {
      message: 'Contact profile photo path retrieved successfully!',
      data: 'file.apiserver.profilePhoto.png',
    });
    expect(result).toEqual(expectedResult);
  });
});
