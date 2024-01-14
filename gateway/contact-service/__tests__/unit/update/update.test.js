const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const jwt = require('jsonwebtoken');
const lambda = require('../../../update');
const { send } = require('../../../utils');

const jestHeaderMock = require('../../../.jest/mock/headers.json');
const jestContactMock = require('../../../.jest/mock/contact.json');
const jestJwtMock = require('../../../.jest/mock/jwt.json');

const response = {
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  },
  body: '{"message":"Contact added successfully!","data":{"contactJSON":{"firstName":"Jon","lastName":"Mark","jobTitle":"Software Engineer","email":[{"address":"johndoe@primelab.in","type":"corporative"}],"phone":[{"number":"+91415555267","type":"mobile"}],"address":[{"street":"St Saint Peter","city":"Unknown","region":"South East","country":"Cão Maior","postalCode":"123456789","type":"home"}],"companies":["Weiland"],"groups":["Terraquian"],"importSource":"UniIndexer","profilePhotoPath":"file.apiserver.profilePhoto.png","contactStatus":"invited","userId":"_BE_Ou5exXqW-wFLuTxud","isFavorite":false,"contactId":"ARVAYmGX-86b3gtfRRJJe"}}}',
};

const sinon = require('sinon');

describe('Create Contact Test Cases', () => {
  let updateSpy;

  beforeAll(() => {
    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => jestJwtMock.jwtMock);
  });

  afterAll(() => {
    updateSpy.mockRestore();
  });

  it('should fail when contact not found', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve(undefined),
    });
    const event = {
      httpMethod: 'PUT',
      body: JSON.stringify(jestContactMock.contactData),
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
      pathParameters: {
        contactId: '123423443',
      },
    };
    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
  });
  it('should fail when contactId is missing in path parameters', async () => {
    const event = {
      httpMethod: 'PUT',
      pathParameters: {
      },
      headers: {
        authorization: jestHeaderMock.AuthCode,
      },
      body: JSON.stringify({
        email: 'myEmail@gmail.com',
      }),
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "contactId" is required.',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when Auth token is missing', async () => {
    const event = {
      httpMethod: 'PUT',
      body: JSON.stringify(jestContactMock.contactData),
      pathParameters: {
        contactId: '123423443',
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
    updateSpy.mockReturnValue({
      promise: () => Promise.reject('Something Went Wrong'),
    });

    const event = {
      httpMethod: 'PUT',
      body: JSON.stringify(jestContactMock.contactData),
      pathParameters: {
        contactId: '123423443',
      },
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error updating contacts!',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when contact schema is not valid', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.reject({ code: 'ConditionalCheckFailedException' }),
    });
    const event = {
      httpMethod: 'PUT',
      body: JSON.stringify(jestContactMock.contactData),
      pathParameters: {
        contactId: '123423443',
      },
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);
    console.log(result);
    const expectedResult = send(StatusCodes.NOT_FOUND, {
      message: 'Error updating contact. contactId: 123423443 not found!',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when contact schema is not valid', async () => {
    const event = {
      httpMethod: 'PUT',
      body: JSON.stringify(jestContactMock.contactDataInvalid),
      pathParameters: {
        contactId: '123423443',
      },
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
    };

    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.BAD_REQUEST, {
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should pass when update contact successfully', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: jestContactMock.contactData }),
    });
    const event = {
      httpMethod: 'PUT',
      body: JSON.stringify(jestContactMock.contactData),
      headers: {
        Authorization: jestHeaderMock.AuthCode,
      },
      pathParameters: {
        contactId: '123423443',
      },
    };
    const result = await lambda.main(event);
    expect(result.body.message).toEqual(response.body.message);
    expect(result.statusCode).toEqual(response.statusCode);
  });
  it('should fail when jwt is not valid', async () => {
    sinon.restore();
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(jestContactMock.contactData),
      headers: {
        Authorization: 'myToken',
      },
      pathParameters: {
        contactId: '123423443',
      },
    };
    const result = await lambda.main(event);
    const expectedResult = send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error updating contacts!',
      data: 'jwt malformed',
    });
    expect(result).toEqual(expectedResult);
  });
});
