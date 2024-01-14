/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const lambda = require('../../../create');
const utils = require('../../../utils');
const mockData = require('../../../mocks/request');

jest.mock('aws-sdk/clients/ssm', () => {
  const mockSSM = {
    getParameter: jest.fn().mockReturnValue({
      promise: () => Promise.resolve({ Parameter: {} }),
    }),
  };
  return jest.fn(() => mockSSM);
});
jest.mock('aws-sdk/clients/sqs', () => {
  const mockSQS = {
    publish: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnThis(),
    }),
  };
  return jest.fn(() => mockSQS);
});

describe('Test create transactions', () => {
  let putSpy;
  let querySpy;

  beforeAll(() => {
    putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    querySpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');

    // It is just the way to bypass the JWT oprations during Test Case
    sinon.stub(jwt, 'verify')
      .callsFake((req, res, next) => mockData.jwtMock);
  });

  afterAll(() => {
    putSpy.mockRestore();
    querySpy.mockRestore();
  });

  it('should fail when body is not passed', async () => {
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      headers: {},
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'payload is missing',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when parameter type is missing', async () => {
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockData.emptyPayload),
      headers: {},
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Parameter type is invalid or missing undefined. Allowed types are: send_token, create_account, create_file, delete_file, grant_file_access, revoke_file_access, nft_series_create, nft_series_mint, create_and_mint_nft',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when parameter type is incorrect', async () => {
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(mockData.incorrectPayload),
      headers: {},
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Parameter type is invalid or missing undefined. Allowed types are: send_token, create_account, create_file, delete_file, grant_file_access, revoke_file_access, nft_series_create, nft_series_mint, create_and_mint_nft',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should pass when parameter type is correct but other fields are invalid', async () => {
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: mockData.payload,
      headers: {},
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid.',
    });

    expect(result.message).toEqual(expectedResult.message);
  });

  it('should fail when InternalServerError', async () => {
    putSpy.mockReturnValue({
      promise: () => Promise.reject({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: mockData.completePayload,
      headers: {},
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR);

    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should pass when parameter type is correct and other fields are also valid', async () => {
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: mockData.completePayload,
      headers: {},
    };

    const result = await lambda.main(event);
    const expectedResult = utils.send(StatusCodes.OK);

    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  test.each(mockData.payloads)(
    'should pass for transaction of type %s',
    async (_, payload) => {
      putSpy.mockReturnValue({
        promise: () => Promise.resolve({ Item: undefined }),
      });
      querySpy.mockReturnValue({
        promise: () => Promise.resolve({ Item: undefined }),
      });

      const event = {
        httpMethod: 'POST',
        body: payload,
        headers: {
          Authorization: mockData.AuthCode,
        },
      };

      const result = await lambda.main(event);
      const expectedResult = utils.send(StatusCodes.OK);

      expect(result.statusCode).toEqual(expectedResult.statusCode);
    },
  );
});
