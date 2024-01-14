const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const { util } = require('webpack');
const lambda = require('../../../delete');
const { send } = require('../../../utils');

const jestEnvMock = require('../../../.jest/mock/environment.json');
const jestHeaderMock = require('../../../.jest/mock/headers.json');
const jestJwtMock = require('../../../.jest/mock/jwt.json');
const jestContactDetailsMock = require('../../../.jest/mock/contact.json');

describe('delete contact service', () => {
  let getSpy;
  let deleteSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    deleteSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'delete');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => jestJwtMock.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should fail when contactId missing', async () => {
    const event = {
      httpMethod: 'DELETE',
      pathParameters: {},
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });

  it('should pass when contactId is correct but user is not authorized', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: jestContactDetailsMock.contactData }),
    });
    const event = {
      httpMethod: 'DELETE',
      body: JSON.stringify({ contactIds: jestEnvMock.contactIds }),
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };
    const result = await lambda.main(event);
    console.log(result);
    expect(result.statusCode).toEqual(200);
  });

  it('should pass when contactId is correct and user is authorized', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: jestContactDetailsMock.contactDetailwithValidContactId }),
    });
    deleteSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });
    const event = {
      httpMethod: 'DELETE',
      body: JSON.stringify({ contactIds: jestEnvMock.contactIds }),
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.OK, {
      message: '2 contacts deleted successfully. ',
      data: {
        success: 2, error: 0, notFound: 0, unauthorized: 0,
      },
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass when contactId is correct and user is authorized - scenario 2', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: jestContactDetailsMock.contactDetailwithValidContactId }),
    });
    deleteSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });
    const event = {
      httpMethod: 'DELETE',
      body: JSON.stringify({ contactIds: [jestEnvMock.contactIds[0]] }),
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.OK, {
      message: '1 contact deleted successfully. ',
      data: {
        success: 1, error: 0, notFound: 0, unauthorized: 0,
      },
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass when contactId is correct but data not found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'DELETE',
      body: JSON.stringify({ contactIds: jestEnvMock.contactIds }),
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };
    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(200);
  });

  it('should fail when contactIds is not in the request body', async () => {
    const event = {
      httpMethod: 'DELETE',
      body: JSON.stringify({ contactId: jestEnvMock.contactIds }),
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: 'Parameter "contactIds" is required in payload.',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when contactIds is not a valid array', async () => {
    const event = {
      httpMethod: 'DELETE',
      body: JSON.stringify({ contactIds: jestEnvMock.contactId }),
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: '"contactIds" should be a valid array',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when jwt is not valid', async () => {
    sinon.restore();
    const event = {
      httpMethod: 'DELETE',
      body: JSON.stringify({ contactIds: jestEnvMock.contactIds }),
      headers: {
        Authorization: 'myToken',
      },
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error deleting contacts to the user!',
      data: 'jwt malformed',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when jwt is missing', async () => {
    sinon.restore();
    const event = {
      httpMethod: 'DELETE',
      body: JSON.stringify({ contactIds: jestEnvMock.contactIds }),
      headers: {
      },
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.UNAUTHORIZED, {
      message: 'Access Token is required.',
    });
    expect(result).toEqual(expectedResult);
  });
});
