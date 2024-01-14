const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const jwt = require('jsonwebtoken');
const lambda = require('../../../favorite');
const { send } = require('../../../utils');

const jestEnvMock = require('../../../.jest/mock/environment.json');
const jestHeaderMock = require('../../../.jest/mock/headers.json');
const jestJwtMock = require('../../../.jest/mock/jwt.json');

describe('Favorite Contact Test Case', () => {
  let getSpy;
  let updateSpy;
  let jwtSpy;
  const { userId } = jestEnvMock;
  const { contactId } = jestEnvMock;
  const contactData = {
    contactId: jestEnvMock.contactId,
  };

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
    jwtSpy = jest.spyOn(jwt, 'verify');
    jwtSpy.mockReturnValue(jestJwtMock.jwtMock);
  });

  afterEach(() => {
    jwtSpy.mockReturnValue(jestJwtMock.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    updateSpy.mockRestore();
  });

  it('should fail when userId is missing in path parameters', async () => {
    const event = {
      httpMethod: 'PUT',
      pathParameters: {
        contactId,
      },
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);

    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "userId" is required.',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when contactId is missing in path parameters', async () => {
    const event = {
      httpMethod: 'PUT',
      pathParameters: {
        userId,
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
      httpMethod: 'PUT',
      pathParameters: {
        userId,
        contactId,
      },
      headers: {},
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.UNAUTHORIZED, {
      message: 'Access Token is required.',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when update is not successful', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: contactData }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve(null),
    });
    const event = {
      httpMethod: 'PUT',
      pathParameters: {
        userId,
        contactId,
      },
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.NOT_FOUND, {
      message: 'Unable to update contact favorite',
      data: {},
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when contactId data not found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve(undefined),
    });
    const event = {
      httpMethod: 'PUT',
      pathParameters: {
        userId,
        contactId,
      },
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.NOT_FOUND, {
      message: `contactId: ${contactId} not found! !`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when update is not successful because of ConditionalCheckFailedException', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.reject({
        code: 'ConditionalCheckFailedException',
      }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.reject({
        code: 'ConditionalCheckFailedException',
      }),
    });
    const event = {
      httpMethod: 'PUT',
      pathParameters: {
        userId,
        contactId,
      },
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.NOT_FOUND, {
      message: `Error updating contact favorite status. userId: ${userId} not found!`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass when successfully update favorite', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: contactData }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Attributes: {} }),
    });
    const event = {
      httpMethod: 'PUT',
      pathParameters: {
        userId,
        contactId,
      },
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.OK, {
      message: 'Contact favorite status updated successfully!',
      data: {},
    });
    expect(result).toEqual(expectedResult);
  });
});
