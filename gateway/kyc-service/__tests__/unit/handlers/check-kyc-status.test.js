/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../check-kyc-status');
const utils = require('../../../utils');

describe('Test kyc service check-kyc-status lambda', () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'scan');
  });

  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should fail when walletId is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {},
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['walletID is a required field'],

    });
    expect(result).toEqual(expectedResult);
  });
  it('should fail when walletId is not match the required pattern', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: '123' },
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      errors: ['walletID fails to match the required pattern'],

    });
    expect(result).toEqual(expectedResult);
  });
  it('should fail when walletId is invalid', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: { walletId: 'manish.testnet' },
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Requested wallet id not found',

    });
    expect(result).toEqual(expectedResult);
  });
});
