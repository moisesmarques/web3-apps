const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const lambda = require('../../../invite');
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

describe('Test invite contact', () => {
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
    const { Host } = jestEnvMock;
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
      message: 'Error invite contacts!',
      data: 'Access Token is required.',
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should pass when contactId is provided', async () => {
    const { Host } = jestEnvMock;

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
  });

  it('should pass when contactId is provided', async () => {
    const { Host } = jestEnvMock;

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
      },
      body: JSON.stringify(eventBody),
    };

    const result = await lambda.main(event);

    // // Compare the result with the expected result
    expect(result.statusCode).toEqual(StatusCodes.OK);
    expect(dynamodb.DocumentClient.prototype.update).toHaveBeenCalled();
  });
});
