const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const lambda = require('../../../block');
const utils = require('../../../utils');

const jestEnvMock = require('../../../.jest/mock/environment.json');
const jestHeaderMock = require('../../../.jest/mock/headers.json');

jest.mock('../../../utils', () => {
  const originalModule = jest.requireActual('../../../utils');

  return {
    ...originalModule,
    verifyAccessToken: jest.fn(),
  };
});

const { appId } = jestEnvMock;
const { contactId } = jestEnvMock;

describe('Test block contact', () => {
  let getSpy;
  let updateSpy;
  let verifyAccessTokenSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
    verifyAccessTokenSpy = jest.spyOn(utils, 'verifyAccessToken');
  });

  // Clean up mocks
  afterAll(() => {
    getSpy.mockRestore();
    updateSpy.mockRestore();
    verifyAccessTokenSpy.mockRestore();
  });

  it('should fail when db response is undefined', async () => {
    const Host = 'test.com';

    verifyAccessTokenSpy.mockReturnValue(
      Promise.resolve({
        userId: 'testUserId',
        walletId: 'test',
        walletName: 'test',
      }),
    );
    const contactMock = undefined;
    updateSpy.mockReturnValueOnce({
      promise: () => Promise.resolve(contactMock),
    });

    const eventBody = {
      appId,
      contactId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        contactId,
      },
      headers: {
        Authorization: jestHeaderMock.AuthCode,
        Host,
      },
      body: JSON.stringify(eventBody),
    };

    const result = await lambda.main(event);

    // // Compare the result with the expected result
    expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
    expect(dynamodb.DocumentClient.prototype.update).toHaveBeenCalled();
  });
  it('should fail when contactId is provided', async () => {
    const Host = 'test.com';

    verifyAccessTokenSpy.mockReturnValue(
      Promise.resolve({
        userId: 'testUserId',
        walletId: 'test',
        walletName: 'test',
      }),
    );
    const contactMock = {
      email: [{ address: 'test.email@example.com' }],
    };

    updateSpy.mockReturnValue({
      promise: () => Promise.reject({ code: 'ConditionalCheckFailedException' }),
    });

    const eventBody = {
      appId,
      contactId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        contactId,
      },
      headers: {
        Authorization: jestHeaderMock.AuthCode,
        Host,
      },
      body: JSON.stringify(eventBody),
    };

    const result = await lambda.main(event);
    // // Compare the result with the expected result
    expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
    expect(dynamodb.DocumentClient.prototype.update).toHaveBeenCalled();
  });
  it('should fail when contactId is missing', async () => {
    const eventBody = {
      appId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: {},
      body: JSON.stringify(eventBody),
    };

    // Invoke retrieve-app()
    const result = await lambda.main(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "contactId" is required.',
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no token is passed', async () => {
    const Host = jestEnvMock.headers;
    verifyAccessTokenSpy.mockImplementationOnce(async () => {
      throw new Error('Access Token is required.');
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        contactId,
      },
      headers: {
        Host,
      },
    };

    // Invoke retrieve-app()
    const result = await lambda.main(event);

    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error blocking contacts!',
      data: 'Access Token is required.',
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it("should fail when contactId doesn't match the regex", async () => {
    const Host = 'test.com';

    verifyAccessTokenSpy.mockReturnValue(
      Promise.resolve({
        userId: 'testUserId',
        walletId: 'test',
        walletName: 'test',
      }),
    );
    const contactMock = {
      email: [{ address: 'test.email@example.com' }],
    };

    updateSpy.mockReturnValueOnce({
      promise: () => Promise.resolve(contactMock),
    });

    const eventBody = {
      appId,
      contactId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        contactId: 'test',
      },
      headers: {
        Authorization: jestHeaderMock.AuthCode,
        Host,
      },
      body: JSON.stringify(eventBody),
    };

    const result = await lambda.main(event);

    // Compare the result with the expected result
    expect(JSON.parse(result.body).message).toEqual(
      'contactId parameter is invalid.',
    );
    // Compare the result with the expected result
    expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });

  it('should pass when contactId is provided', async () => {
    const Host = 'test.com';

    verifyAccessTokenSpy.mockReturnValue(
      Promise.resolve({
        userId: 'testUserId',
        walletId: 'test',
        walletName: 'test',
      }),
    );
    const contactMock = {
      email: [{ address: 'test.email@example.com' }],
    };

    updateSpy.mockReturnValueOnce({
      promise: () => Promise.resolve(contactMock),
    });

    const eventBody = {
      appId,
      contactId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        contactId,
      },
      headers: {
        Authorization: jestHeaderMock.AuthCode,
        Host,
      },
      body: JSON.stringify(eventBody),
    };

    const result = await lambda.main(event);

    // // Compare the result with the expected result
    expect(result.statusCode).toEqual(StatusCodes.OK);
    expect(dynamodb.DocumentClient.prototype.update).toHaveBeenCalled();

    updateSpy.mockRestore();
  });
});
