const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const lambda = require('../../../create');
const { send } = require('../../../utils');

const jestEnvMock = require('../../../.jest/mock/environment.json');
const jestHeaderMock = require('../../../.jest/mock/headers.json');
const jestContactMock = require('../../../.jest/mock/contact.json');
const jestJwtMock = require('../../../.jest/mock/jwt.json');

const response = {
  statusCode: 201,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  },
  body: '{"message":"Contact added successfully!","data":{"contactJSON":{"firstName":"Jon","lastName":"Mark","jobTitle":"Software Engineer","email":[{"address":"johndoe@primelab.in","type":"corporative"}],"phone":[{"number":"+91415555267","type":"mobile"}],"address":[{"street":"St Saint Peter","city":"Unknown","region":"South East","country":"Cão Maior","postalCode":"123456789","type":"home"}],"companies":["Weiland"],"groups":["Terraquian"],"importSource":"UniIndexer","profilePhotoPath":"file.apiserver.profilePhoto.png","contactStatus":"invited","userId":"_BE_Ou5exXqW-wFLuTxud","isFavorite":false,"contactId":"ARVAYmGX-86b3gtfRRJJe"}}}',
};

describe('Create Contact Test Cases', () => {
  let putSpy;
  let querySpy;

  beforeAll(() => {
    putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    querySpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');

    sinon.stub(jwt, 'verify').callsFake(() => jestJwtMock.jwtMock);
  });

  afterAll(() => {
    putSpy.mockRestore();
    querySpy.mockRestore();
  });

  it('should fail if query parameters not set', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(jestContactMock.contactData),
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
      queryStringParameters: {},
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: 'One of email, phone or id query parameter is required',
    });
    expect(result).toEqual(expectedResult);
  });

  //
  it('should fail if id is not found', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Count: 0 }),
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(jestContactMock.contactData),
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
      queryStringParameters: {
        id: 'fake id',
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: 'Invalid near account. Please try again',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail if phone is not found', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Count: 0 }),
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(jestContactMock.contactData),
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
      queryStringParameters: {
        phone: '1233567890',
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: 'Invalid near account. Please try again',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail if email is not found', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Count: 0 }),
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(jestContactMock.contactData),
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
      queryStringParameters: {
        email: 'fake@email.com',
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: 'Invalid near account. Please try again',
    });
    expect(result).toEqual(expectedResult);
  });

  // Test-1 Passed
  it('should fail when Auth token is missing', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(jestEnvMock.emptyPayload),
      headers: {},
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.UNAUTHORIZED, {
      message: 'Access Token is required.',
    });
    expect(result).toEqual(expectedResult);
  });

  // Test-2 Passed
  it('should fail when create is not successful', async () => {
    putSpy.mockReturnValue({
      // eslint-disable-next-line prefer-promise-reject-errors
      promise: () => Promise.reject('Something Went Wrong'),
    });
    querySpy.mockReturnValue({
      // eslint-disable-next-line prefer-promise-reject-errors
      promise: () => Promise.reject('Something Went Wrong'),
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(jestContactMock.contactData),
      queryStringParameters: {
        email: 'john.doe@email.com',
      },
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error adding contacts to the user!',
    });
    expect(result).toEqual(expectedResult);
  });

  // Test-3 Passed
  it('should fail when contact schema is not valid', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Count: 1 }),
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(jestContactMock.contactDataInvalid),
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
      queryStringParameters: {
        phone: '9806844382',
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: '"name" is not allowed, Email or Phone or nearAccount is required',
      errors: ['"name" is not allowed', 'Email or Phone or nearAccount is required'],
    });
    expect(result).toEqual(expectedResult);
  });

  // Test-4 Passed
  it('should pass when successfully created contact', async () => {
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: jestContactMock.contactData }),
    });
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Count: 1 }),
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(jestContactMock.contactData),
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
      queryStringParameters: {
        email: 'john@doe.com',
      },
    };
    const result = await lambda.main(event);
    console.log('result', response.body.message);
    expect(result.body.message).toEqual(response.body.message);
    expect(result.statusCode).toEqual(response.statusCode);
  });

  // Test-5 Passed
  it('should fail when jwt is not valid - scenario 1', async () => {
    sinon.restore();
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(jestEnvMock.emptyPayload),
      headers: {
        Authorization: 'myToken',
      },
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error adding contacts to the user!',
      data: 'jwt malformed',
    });
    expect(result).toEqual(expectedResult);
  });

  // Test-6 Passed
  it('should fail when jwt is not valid - scenario 2', async () => {
    sinon.restore();
    sinon.stub(jwt, 'verify').callsFake(() => jestJwtMock.jwtWithouUser);
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(jestEnvMock.emptyPayload),
      headers: {
        Authorization: 'myToken',
      },
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.UNAUTHORIZED, {
      message: 'Unauthorized',
    });
    expect(result).toEqual(expectedResult);
  });
});
