/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const lambda = require('../../../list-transaction-by-contact');
const utils = require('../../../utils');
const { getContact } = require('../../../lib/model/contacts');
const { listUserWallets } = require('../../../lib/model/wallets');
const { getTransactionById } = require('../../../lib/model/transaction');
const { listNftByOwnerId } = require('../../../lib/model/nft');

const data = require('./mock/request');
const {
  transactionMock, listWalletMock, response200, contactMock, contactMock1, myNft,
} = require('./mock/response');

jest.mock('../../../lib/model/contacts', () => ({
  getContact: jest.fn(),
}));

jest.mock('../../../lib/model/wallets', () => ({
  listUserWallets: jest.fn(),
}));

jest.mock('../../../lib/model/transaction', () => ({
  getTransactionById: jest.fn(),
}));

jest.mock('../../../lib/model/nft', () => ({
  listNftByOwnerId: jest.fn(),
}));

describe('Test list-transaction-by-contactId', () => {
  let getSpy;
  beforeAll(() => {
    // It is just the way to bypass the DynamoDB oprations during Test Case
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    // It is just the way to bypass the JWT oprations during Test Case
    sinon.stub(jwt, 'verify')
      .callsFake(() => data.jwtMock);
  });

  afterAll(() => {
    sinon.restore();
  });

  it('should return 200 with Transactions', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { contactId: data.contactId },
      headers: { Authorization: data.AuthCode },
    };
    getContact.mockResolvedValueOnce(contactMock);
    listUserWallets.mockResolvedValueOnce(listWalletMock);
    getTransactionById.mockResolvedValueOnce(transactionMock);
    listNftByOwnerId.mockResolvedValueOnce(myNft);

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'Transaction by contactId retrieved successfully',
      data: response200,
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should return 200 when no NFT is found', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { contactId: data.contactId },
      headers: { Authorization: data.AuthCode },
    };
    getContact.mockResolvedValueOnce(contactMock);
    listUserWallets.mockResolvedValueOnce(listWalletMock);
    getTransactionById.mockResolvedValueOnce(transactionMock);
    listNftByOwnerId.mockResolvedValueOnce([]);

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'Transaction by contactId retrieved successfully',
      data: response200,
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should return 200 with No Transactions', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { contactId: data.contactId },
      headers: { Authorization: data.AuthCode },
    };
    getContact.mockResolvedValueOnce(contactMock);
    listUserWallets.mockResolvedValueOnce(listWalletMock);
    getTransactionById.mockResolvedValueOnce(transactionMock);
    listNftByOwnerId.mockResolvedValueOnce(data.ownerId);

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'No Transaction found',
      data: response200,
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should fail when userId is not found', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { contactId: data.contactId },
      headers: { Authorization: data.AuthCode },
    };
    getContact.mockResolvedValueOnce(contactMock1);
    listUserWallets.mockResolvedValueOnce(listWalletMock);
    getTransactionById.mockResolvedValueOnce(transactionMock);
    listNftByOwnerId.mockResolvedValueOnce(myNft);

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error NFT Collection',
      data: 'User does not associated with it\'s identity',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass with Transactions', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { contactId: data.contactId },
      headers: { Authorization: data.AuthCode },
    };
    getContact.mockResolvedValueOnce(contactMock);
    listUserWallets.mockResolvedValueOnce(listWalletMock);
    getTransactionById.mockResolvedValueOnce(transactionMock);
    listNftByOwnerId.mockResolvedValueOnce(myNft);

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'Transaction by contactId retrieved successfully.',
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
    expect(result.message).toEqual(expectedResult.message);
  });

  it('should fail with InternalServerError', async () => {
    const event = {
      httpMethod: 'GET',
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Transaction by contactId retrieved successfully.',
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
    expect(result.message).toEqual(expectedResult.message);
  });

  it('should fail when Contact not found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: { contactId: data.contactId },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Error NFT Collection',
      data: 'Contact not found',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when token is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { contactId: data.contactId },
      headers: {},
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error NFT Collection', data: 'invalid token',
    });

    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });
  it('should return 500 Internal server error if pathParameters missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      headers: { Authorization: data.AuthCode },
    };
    listNftByOwnerId.mockRejectedValueOnce('Table is invalid');
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "contactId" is required.',
    });
    expect(result).toEqual(expectedResult);
  });
});
