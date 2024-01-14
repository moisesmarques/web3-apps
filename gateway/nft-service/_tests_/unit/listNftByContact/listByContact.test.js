/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const lambda = require('../../../list-by-contact');
const utils = require('../../../utils');
const { getContact } = require('../../../lib/model/contacts');
const { listUserWallets } = require('../../../lib/model/wallets');
const { getTransactionById } = require('../../../lib/model/transaction');
const { listNftByOwnerId } = require('../../../lib/model/nft');

const data = require('./mock/request');
const {
  transactionMock, listWalletMock, response200, contactMock, blankListWalletMock, contactWithOutUserIdMock, myNft,
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

describe('Test list-by-contactId', () => {
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

  it('should return 200 with NFT', async () => {
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
      message: 'NFT by contactId retrieved successfully',
      data: response200,
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should return 200 with NFT1', async () => {
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
      message: 'NFT by contactId retrieved successfully',
      data: response200,
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should return 200 with NFT2', async () => {
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
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'No Collectibles found',
      data: [],
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
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Error NFTs list by contactId',
      data: `Contact not found by contactId: ${data.contactId}`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should return 400 Bad Request if pathParameter is empty', async () => {
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

  it('should fail with InternalServerError when pathParameter is missing', async () => {
    const event = {
      httpMethod: 'GET',
      headers: { Authorization: data.AuthCode },
    };
    listNftByOwnerId.mockRejectedValueOnce('Table is invalid');
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error NFTs list by contactId',
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
    expect(result.message).toEqual(expectedResult.message);
  });

  it('should return blank list if no NFTs are assocaited with given Contact', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { contactId: data.contactId },
      headers: { Authorization: data.AuthCode },
    };
    getContact.mockResolvedValueOnce(contactMock);
    listUserWallets.mockResolvedValueOnce(blankListWalletMock);
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'No Collectibles found',
      data: [],
    });
    expect(result).toEqual(expectedResult);
  });

  it('Given user is not associated with Nft owner Id', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { contactId: data.contactId },
      headers: { Authorization: data.AuthCode },
    };
    getContact.mockResolvedValueOnce(contactWithOutUserIdMock);
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Error NFTs list by contactId',
      data: 'User is not associated with userId',
    });
    expect(result).toEqual(expectedResult);
  });
});
