const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const lambda = require('../../../import');
const { send } = require('../../../utils');

const jestEnvMock = require('../../../.jest/mock/environment.json');
const jestHeaderMock = require('../../../.jest/mock/headers.json');
const jestContactMock = require('../../../.jest/mock/contact.json');
const jestJwtMock = require('../../../.jest/mock/jwt.json');

describe('Import Contact Test Case', () => {
  let batchWriteSpy;

  beforeAll(() => {
    batchWriteSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'batchWrite');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => jestJwtMock.jwtMock);
  });

  afterAll(() => {
    batchWriteSpy.mockRestore();
  });

  it('should fail when no body params passed', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        userId: jestEnvMock.userId,
      },
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);

    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: 'Body should not be empty.',
    });

    expect(result).toMatchObject(expectedResult);
  });

  it('should fail when userId is missing in path parameters', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
      },
      body: JSON.stringify(jestContactMock.validPayload),
      headers: {
        authorization: jestJwtMock.AuthCode,
      },
    };

    const result = await lambda.main(event);

    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "userId" is required.',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when Auth token is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        userId: jestEnvMock.userId,
      },
      body: JSON.stringify(jestContactMock.validPayload),
      headers: {},
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.UNAUTHORIZED, {
      message: 'Access Token is required.',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no email and phone number found', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        userId: jestEnvMock.userId,
      },
      body: JSON.stringify(jestContactMock.noEmailAndPhonePayload),
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.UNAUTHORIZED, {
      data: {
        errorMessage: ['One value is mandatory from email and phone'],
      },
    });
    expect(JSON.parse(result.body)).toMatchObject(JSON.parse(expectedResult.body));
  });

  it('should pass with valid payload - scenario 1', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        userId: jestEnvMock.userId,
      },
      body: JSON.stringify(jestContactMock.invalidPayload),
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);

    const expectedResult = send(StatusCodes.OK, {
      message: 'Contacts imported.',
      data: {
        contactsImported: 0,
        contactsNotImported: 1,
      },
    });

    console.log(result);
    expect(JSON.parse(result.body)).toMatchObject(JSON.parse(expectedResult.body));
    expect(result.statusCode).toBe(expectedResult.statusCode);
  });

  it('should pass with valid payload - scenario 2', async () => {
    batchWriteSpy.mockReturnValue({
      promise: () => Promise.resolve({
        UnprocessedItems: {},
      }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        userId: jestEnvMock.userId,
      },
      body: JSON.stringify(jestContactMock.validPayload),
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);

    const expectedResult = send(StatusCodes.OK, {
      message: 'Contacts imported.',
      data: {
        contactsImported: 1,
        contactsNotImported: 0,
      },
    });

    expect(JSON.parse(result.body)).toMatchObject(JSON.parse(expectedResult.body));
    expect(result.statusCode).toBe(expectedResult.statusCode);
  });

  it('should pass with valid payload - scenario 3', async () => {
    batchWriteSpy.mockReturnValue({
      promise: () => Promise.resolve({
        UnprocessedItems: {},
      }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        userId: jestEnvMock.userId,
      },
      body: JSON.stringify(jestContactMock.noEmailPayload),
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);

    const expectedResult = send(StatusCodes.OK, {
      message: 'Contacts imported.',
      data: {
        contactsImported: 1,
        contactsNotImported: 0,
      },
    });

    expect(JSON.parse(result.body)).toMatchObject(JSON.parse(expectedResult.body));
    expect(result.statusCode).toBe(expectedResult.statusCode);
  });

  it('should fail when joi schema is not matching', async () => {
    batchWriteSpy.mockReturnValue({
      promise: () => Promise.reject({
        UnprocessedItems: {},
      }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        userId: jestEnvMock.userId,
      },
      body: JSON.stringify(jestContactMock.validPayload),
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);

    const expectedResult = send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error importing contacts!',
    });

    expect(JSON.parse(result.body)).toMatchObject(JSON.parse(expectedResult.body));
    expect(result.statusCode).toBe(expectedResult.statusCode);
  });
});
