// @ts-nocheck
/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../register');
const utils = require('../../../utils');

describe('Test kyc service create-user lambda', () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should fail when Unexpected Error occurs', async () => {
    getSpy.mockReturnValue({
      // eslint-disable-next-line prefer-promise-reject-errors
      promise: () => Promise.reject({
        code: 'SyntaxError',
      }),
    });
    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({
        email: 'test@xyz.com',
        walletName: 'test.near',
        firstName: 'first',
        lastName: 'last',
        countryCode: '91',
      }),
    };
    const result = await lambda.handler(event);
    expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should fail when body is not passed', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Payload is missing',

    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when payload is incorrect', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({
        email: 'test@xyz.com',
      }),
    };
    const result = await lambda.handler(event);
    expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });

  it('should pass when payload is correct', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({
        email: 'test@xyz.com',
        walletName: 'test.near',
        firstName: 'first',
        lastName: 'last',
        countryCode: '91',
      }),
    };
    const result = await lambda.handler(event);
    expect(result.statusCode).toEqual(StatusCodes.CREATED);
  });
});
