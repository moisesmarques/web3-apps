const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const utils = require('../../../utils');

const lambda = require('../../../connect');

const AuthCode = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJWMVN0R1hSOF9aNjVkSGk2Qi1teVQiLCJmaXJzdE5hbWUiOiJ0ZXN0IiwibGFzdE5hbWUiOiJ1c2VyIiwid2FsbGV0SWQiOiJ3YWZnZXNoLm5lYXIiLCJlbWFpbCI6Im1vY2stdGVzdEBwcmltZWxhYi5pbyIsInBob25lIjoiKzI1NTE4MTcxODEiLCJkb2IiOiIyMDAwLTEwLTEwIn0.SIF6-9zZVldAqsMi0fb_UgiaHmRd8h7HN3tBmcf-SAI';
const jwtMock = {
  lastName: 'Kivite',
  userId: '_BE_Ou5exXqW-wFLuTxud',
  status: 'active',
  created: 1646209318710,
  isPhoneVerified: false,
  email: 'tkivite@gmail.com',
  firstName: 'Titus',
  isEmailVerified: false,
  iat: 1646327133,
};
jwtMockWithoutUserId = {
  lastName: 'Kivite',
  status: 'active',
  created: 1646209318710,
  isPhoneVerified: false,
  email: 'tkivite@gmail.com',
  firstName: 'Titus',
  isEmailVerified: false,
  iat: 1646327133,
};
describe('Test Connect App test case', () => {
  let querySpy;
  let putSpy;

  beforeAll(() => {
    querySpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
    putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');

    sinon.stub(jwt, 'verify')
      .callsFake(() => jwtMock);
  });

  afterAll(() => {
    sinon.restore();
  });

  it('should fail when token is missing', async () => {
    const event = {
      httpMethod: 'POST',
      queryStringParameters: {},
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error connecting apps to the user!',
      data: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when appId is missing on body', async () => {
    const event = {
      httpMethod: 'POST',
      queryStringParameters: {},
      headers: { Authorization: AuthCode },
      body: JSON.stringify({
      }),
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST);
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should pass when appId is present in body', async () => {
    const Item = {
      connectionId: 'Test app',
    };

    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }),
    });
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [Item] }),
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        appId: 'DGWS4dPa8dejsDNMMlwzg',
      }),
      headers: { Authorization: AuthCode },
    };

    const result = await lambda.handler(event);
    console.log(result);
    expect(result.statusCode).toEqual(StatusCodes.OK);
  });
  it('should pass when appId is present in body', async () => {
    const Item = {
      connectionId: 'Test app',
    };

    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }),
    });
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [Item] }),
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        appId: 'DGWS4dPa8dejsDNMMlwzg',
      }),
      headers: { Authorization: AuthCode },
    };

    const result = await lambda.handler(event);
    console.log(result);
    expect(result.statusCode).toEqual(StatusCodes.OK);
  });
  it('should pass when appId is present in body', async () => {
    const Item = {
      connectionId: 'Test app',
    };

    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [{ appId: 'UNupDoXBa2ZnhzI66E8xz' }] }),
    });
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [Item] }),
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        appId: 'DGWS4dPa8dejsDNMMlwzg',
      }),
      headers: { Authorization: AuthCode },
    };

    const result = await lambda.handler(event);
    expect(result.statusCode).toEqual(StatusCodes.OK);
  });
  it('should fail with error that app already connected', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [{ appId: 'UNupDoXBa2ZnhzI66E8xz' }] }),
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        appId: 'UNupDoXBa2ZnhzI66E8xz',
      }),
      headers: { Authorization: AuthCode },
    };
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error connecting apps to the user!',
      data: 'App already connected to the user',
    });
    const result = await lambda.handler(event);
    expect(result).toEqual(expectedResult);
  });
  it('should fail with error from DB', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.reject('something went wrong'),
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        appId: 'UNupDoXBa2ZnhzI66E8xz',
      }),
      headers: { Authorization: AuthCode },
    };
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error connecting apps to the user!',
    });
    const result = await lambda.handler(event);
    expect(result).toEqual(expectedResult);
  });

  it('should fail when jwt is not valid', async () => {
    sinon.restore();
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => jwtMockWithoutUserId);
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        appId: 'UNupDoXBa2ZnhzI66E8xz',
      }),
      headers: {
        Authorization: 'myToken',
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error connecting apps to the user!',
      data: 'You are not authorized to perform this operation',
    });
    expect(result).toEqual(expectedResult);
  });
});
