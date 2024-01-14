/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const validator = require('../../../middleware/validator');

const lambda = require('../../../list');

const senderWalletId = 'pougeuxsyci.near';
const walletId = 'pougeuxsyci.near';
const receiverWalletId = 'pougeuxsyci.near';
const startDate = '2022-03-01';
const endDate = '2022-03-10';
const type = 'mint_nft';
const application = 'NFTMaker';
const status = 'pending';
const lastItem = 'true';

describe('Test List', () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
  });

  // Clean up mocks
  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should fail when senderWalletId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {},
      headers: {},
    };

    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });

  it('should pass when correct senderWalletId is passed', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        senderWalletId,
      },
      headers: {},
    };

    const result = await lambda.main(event);
    // Compare the result with the expected result
    expect(result.statusCode).toEqual(StatusCodes.OK);
  });

  it('should fail when both senderWalletId and walletId is passed', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: { senderWalletId, walletId },
      headers: {},
    };

    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });

  it('should fail when both senderWalletId and walletId is passed', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: { receiverWalletId, walletId },
      headers: {},
    };

    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });

  it('should fail when receiverWalletId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {},
      headers: {},
    };

    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });

  it('should fail when InternalServerError', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.reject({ Item: undefined }),
    });
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        receiverWalletId,
      },
      headers: {},
    };
    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it('should pass when correct receiverWalletId is passed', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        receiverWalletId,
      },
      headers: {},
    };
    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.OK);
  });

  it('should pass when correct receiverWalletId, startDate and endDate is passed', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        receiverWalletId,
        startDate,
        endDate,
      },
      headers: {},
    };
    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.OK);
  });

  it('should pass when correct receiverWalletId and type is passed', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        receiverWalletId,
        type,
      },
      headers: {},
    };
    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.OK);
  });

  it('should pass when correct receiverWalletId and application is passed', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        receiverWalletId,
        application,
      },
      headers: {},
    };
    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.OK);
  });

  it('should pass when correct receiverWalletId and status is passed', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        receiverWalletId,
        status,
      },
      headers: {},
    };
    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.OK);
  });

  it('should pass when correct receiverWalletId and lastItem is passed', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        receiverWalletId,
        lastItem,
      },
      headers: {},
    };
    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.OK);
  });

  it('should fail when queryStringParameters is wrong', async () => {
    const event = {
      httpMethod: 'GET',
      queryStringParameter: {
        receiverWalletId,
      },
      headers: {},
    };

    const result = await lambda.main(event);
    expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});

describe('Test List 1', () => {
  let getSpy1;

  beforeAll(() => {
    getSpy1 = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
  });

  // Clean up mocks
  afterAll(() => {
    getSpy1.mockRestore();
  });

  it('should pass when correct receiverWalletId is passed and has LastEvaluatedKey', async () => {
    getSpy1.mockReturnValue({
      promise: () => Promise.resolve({ Items: undefined, LastEvaluatedKey: { transactionId: 'test1', senderWalletId } }),
    });
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        senderWalletId,
      },
      headers: {},
    };
    const result = await lambda.main(event);
    console.log('Main test---------------------------------');
    console.log(result);
    expect(result.statusCode).toEqual(StatusCodes.OK);
    // getSpy.mockRestore();
  });
});
