/* eslint-disable no-undef */
const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');

const sinon = require('sinon');
const lambda = require('../../../gift');
const utils = require('../../../utils');
const Contacts = require('../../../lib/model/contacts');
const Users = require('../../../lib/model/users');
const Wallets = require('../../../lib/model/wallets');
const data = require('./mock/request');

jest.mock('../../../lib/model/contacts', () => jest.fn());
jest.mock('../../../lib/model/users', () => jest.fn());
jest.mock('../../../lib/model/wallets', () => jest.fn());
jest.mock(
  'aws-sdk/clients/sqs',
  () =>
    // eslint-disable-next-line implicit-arrow-linebreak
    jest.fn().mockReturnValue({
      sendMessageBatch: jest.fn().mockReturnThis(),
      promise: jest.fn().mockReturnThis(),
    }),
  // eslint-disable-next-line function-paren-newline
);

Contacts.batchGetContacts = jest.fn();

Users.batchGetUsers = jest.fn();
Users.getUserByEmail = jest.fn();
Users.getUserByPhone = jest.fn();

Wallets.listUserWallets = jest.fn();

// jest.mock('bluebird', () => jest.fn());
// BPromise.map = jest.fn();

describe('Test gift-nft', () => {
  let getSpy;

  beforeAll(() => {
    // It is just the way to bypass the DynamoDB oprations during Test Case
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    // It is just the way to bypass the JWT oprations during Test Case
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock);
  });

  afterAll(() => {
    sinon.restore();
  });

  it('should fail when token is missing', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.payload),
      pathParameters: {
        nftId: data.nftId,
      },
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'invalid token',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when nftId is missing on path param', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.payload),
      pathParameters: {},
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Missing nftId path param',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when payload is empty', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.emptyPayload),
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Missing contactIds in body',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when contactIds param is not an array', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.malformedPayload),
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'contactIds must be an array',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when NFT does not belong to user', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.nft }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.payload),
      pathParameters: {
        nftId: data.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message:
        "You are not allowed gift this NFT 's2fwZUGh8FMbFVvkxjX3m' as it does not belong to your wallet",
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when NFT does not exists', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.payload),
      pathParameters: {
        nftId: data.incorrectNft.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: "NFT with id 's2fwZUGh8FMbFVvkxjX3asam' not found",
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail if any contacts are not found in database', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.nft2 }),
    });

    Contacts.batchGetContacts.mockReturnValueOnce(data.contacts2);
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.payload),
      pathParameters: {
        nftId: data.myNft.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message:
        'Some of the provided contactIds were not found: 28p5XRTIoOBFU_ui6sBzB,2wwwXRTIoOBFU_ui6sBzB,_0iM999D5fkKFi6l9878989',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when User wallet not found.', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.nft2 }),
    });

    Contacts.batchGetContacts.mockReturnValueOnce(
      data.contactsWithExistingUserId,
    );
    Users.batchGetUsers.mockReturnValueOnce(data.users);
    Users.getUserByEmail.mockReturnValueOnce(data.users[0]);
    Users.getUserByPhone.mockReturnValueOnce(data.users[0]);
    Wallets.listUserWallets.mockResolvedValue([]);

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.payload),
      pathParameters: {
        nftId: data.myNft.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'User wallet not found',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass with NFT sent successfully', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.nft2 }),
    });

    Contacts.batchGetContacts.mockReturnValueOnce(
      data.contactsWithExistingUserId,
    );
    Users.batchGetUsers.mockReturnValueOnce(data.users);
    Users.getUserByEmail.mockReturnValueOnce(data.users[0]);
    Users.getUserByPhone.mockReturnValueOnce(data.users[0]);
    Wallets.listUserWallets.mockResolvedValue([
      { walletId: 'testWallet', isPrimary: true },
      { walletId: 'testWallet2', isPrimary: false },
    ]);

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify(data.payload),
      pathParameters: {
        nftId: data.myNft.nftId,
      },
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'NFT sent successfully.',
    });
    expect(result).toEqual(expectedResult);
  });
});
