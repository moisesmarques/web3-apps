const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const utils = require('../../../utils');
const lambda = require('../../../share');

jest.mock('../../../utils', () => {
  const originalModule = jest.requireActual('../../../utils');

  return {
    ...originalModule,
    verifyAccessToken: jest.fn(),
    getParam: jest.fn(),
    sendEmail: jest.fn(),
  };
});

const Authorization = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkIjoxNjQ2MzAzMzgzNzM1LCJzdGF0dXMiOiJhY3RpdmUiLCJpc1Bob25lVmVyaWZpZWQiOmZhbHNlLCJpc0VtYWlsVmVyaWZpZWQiOmZhbHNlLCJlbWFpbCI6InRlc3Rmb3JpdmFuQGdtYWlsLmNvbSIsImZpcnN0TmFtZSI6IlRlc3QiLCJsYXN0TmFtZSI6Ikl2YW4iLCJ1c2VySWQiOiJWMVN0R1hSOF9aNjVkSGk2Qi1teVQiLCJ3YWxsZXROYW1lIjoidGVzdGZvcml2YW4ubmVhciIsImlhdCI6MTY0NjMwMzM4M30.SuOtqyIW76ZY3_Y3ijWuPPcZ5gGDz1wWgTgPL8H4E6o';
const appId = 'DGWS4dPa8dejsDNMMlwzg';
const contactId = 'DGWS4dPa8dejsDNMMlwzg';

describe('Test share App', () => {
  let getSpy;
  let verifyAccessTokenSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    verifyAccessTokenSpy = jest.spyOn(utils, 'verifyAccessToken');
  });

  // Clean up mocks
  afterAll(() => {
    getSpy.mockRestore();
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
      errors: [{ message: '"contactId" is required' }],
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail when body is missing or ivalid', async () => {
    const eventBody = {
      appId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: {},
    };

    // Invoke retrieve-app()
    const result = await lambda.main(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: [{ message: 'Invalid Json payload' }],
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
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
      errors: [{ message: '"contactId" is required' }],
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail when appId is missing', async () => {
    const eventBody = {
      contactId,
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
      errors: [{ message: '"appId" is required' }],
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no token is passed', async () => {
    verifyAccessTokenSpy.mockImplementationOnce(async () => {
      throw new Error('Access Token is required.');
    });
    const eventBody = {
      contactId,
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

    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      errors: [{ message: 'Access Token is required.' }],
    });

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail when appId less than 6 chars', async () => {
    verifyAccessTokenSpy.mockReturnValue(
      Promise.resolve({
        userId: 'testUserId',
        walletId: 'test',
        walletName: 'test',
      }),
    );
    const newAppId = 'abc';
    const eventBody = {
      contactId,
      appId: newAppId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: {
        Authorization,
      },
      body: JSON.stringify(eventBody),
    };

    const result = await lambda.main(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: [
        {
          message: '"appId" length must be at least 6 characters long',
        },
      ],
    });

    // console.log(verifyAccessTokenSpy.mock.calls);
    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail when appId greater than 25 chars', async () => {
    verifyAccessTokenSpy.mockReturnValue(
      Promise.resolve({
        userId: 'testUserId',
        walletId: 'test',
        walletName: 'test',
      }),
    );
    const newAppId = 'This string is longer than twenty five characters';
    const eventBody = {
      contactId,
      appId: newAppId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: {
        Authorization,
      },
      body: JSON.stringify(eventBody),
    };

    const result = await lambda.main(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: [
        {
          message:
            '"appId" length must be less than or equal to 25 characters long',
        },
      ],
    });

    // console.log(verifyAccessTokenSpy.mock.calls);
    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail when contactId less than 6 chars', async () => {
    verifyAccessTokenSpy.mockReturnValue(
      Promise.resolve({
        userId: 'testUserId',
        walletId: 'test',
        walletName: 'test',
      }),
    );
    const newAppId = 'abc';
    const eventBody = {
      appId,
      contactId: newAppId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: {
        Authorization,
      },
      body: JSON.stringify(eventBody),
    };

    const result = await lambda.main(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: [
        {
          message: '"contactId" length must be at least 6 characters long',
        },
      ],
    });

    // console.log(verifyAccessTokenSpy.mock.calls);
    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });

  it('should fail when contactId greater than 25 chars', async () => {
    verifyAccessTokenSpy.mockReturnValue(
      Promise.resolve({
        userId: 'testUserId',
        walletId: 'test',
        walletName: 'test',
      }),
    );
    const newAppId = 'This string is longer than twenty five characters';
    const eventBody = {
      appId,
      contactId: newAppId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: {
        Authorization,
      },
      body: JSON.stringify(eventBody),
    };

    const result = await lambda.main(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: [
        {
          message:
            '"contactId" length must be less than or equal to 25 characters long',
        },
      ],
    });

    // console.log(verifyAccessTokenSpy.mock.calls);
    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });
  it('should fail when app does not exist', async () => {
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
    getSpy
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: contactMock }),
      })
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: undefined }),
      });
    const getParamSpy = jest.spyOn(utils, 'getParam');
    getParamSpy.mockImplementation(async () => 'test@email.com');

    const eventBody = {
      appId,
      contactId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: {
        Authorization,
      },
      body: JSON.stringify(eventBody),
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      errors: [{ message: 'The app you are sharing does not exist' }],
    });

    expect(result).toEqual(expectedResult);
    getParamSpy.mockRestore();
  });
  it('should fail when contact is not valid', async () => {
    verifyAccessTokenSpy.mockReturnValue(
      Promise.resolve({
        userId: 'testUserId',
        walletId: 'test',
        walletName: 'test',
      }),
    );
    const contactMock = { name: 'titus' };
    const appMock = {
      appName: 'test app',
    };
    getSpy
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: contactMock }),
      })
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: appMock }),
      });

    const getParamSpy = jest.spyOn(utils, 'getParam');
    getParamSpy.mockImplementation(async () => 'test@email.com');

    const eventBody = {
      appId,
      contactId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: {
        Authorization,
      },
      body: JSON.stringify(eventBody),
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      errors: [{ message: 'The contact does not have a valid email address' }],
    });
    expect(result).toEqual(expectedResult);
    getParamSpy.mockRestore();
  });

  it('should fail when reply email is missing', async () => {
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
    const appMock = {
      appName: 'test app',
    };
    getSpy
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: contactMock }),
      })
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: appMock }),
      });

    //  const sendEmailSpy = jest.spyOn(utils, 'sendEmail');
    // sendEmailSpy.mockImplementationOnce(async () => Promise.resolve());
    const getParamSpy = jest.spyOn(utils, 'getParam');
    getParamSpy.mockImplementation(async () => undefined);

    const eventBody = {
      appId,
      contactId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: {
        Authorization,
      },
      body: JSON.stringify(eventBody),
    };

    const result = await lambda.main(event);
    // const appLink = `${process.env.APP_LINK_BASE_URL}/${appMock.appName}`;
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      errors: [{ message: 'Email parameter missing' }],
    });

    // // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
    getParamSpy.mockRestore();
  });

  it('should share app when contactId and appId is provided', async () => {
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
    const appMock = {
      appName: 'test app',
      appUrl: 'http://appUrl.io',
    };
    getSpy
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: contactMock }),
      })
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: appMock }),
      });

    const sendEmailSpy = jest.spyOn(utils, 'sendEmail');
    sendEmailSpy.mockImplementationOnce(async () => Promise.resolve());
    const getParamSpy = jest.spyOn(utils, 'getParam');
    getParamSpy.mockImplementation(async () => 'testEmail@example.com');

    const eventBody = {
      appId,
      contactId,
    };
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: {
        Authorization,
      },
      body: JSON.stringify(eventBody),
    };

    const result = await lambda.main(event);
    const appLink = `${appMock.appUrl}`;
    const expectedResult = utils.send(200, {
      message: "Applink sent successfully to contact's email",
      sharedAppLink: appLink,
    });

    // // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
    expect(utils.sendEmail).toHaveBeenCalled();
    sendEmailSpy.mockRestore();
    getParamSpy.mockRestore();
  });
});
