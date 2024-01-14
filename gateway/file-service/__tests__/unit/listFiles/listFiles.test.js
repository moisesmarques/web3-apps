/* eslint-disable no-undef */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const lambda = require('../../../lambda/listFiles/index');
const utils = require('../../../utils');
const data = require('./mock/request.json');
const files = require('../../../src/models/files');

describe('Test list files lambda', () => {
  let getSpy;
  let getFileSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    getFileSpy = jest.spyOn(files, 'getFiles');
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    getFileSpy.mockRestore();
    sinon.restore();
  });

  it('should fail when auth is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        walletId: data.payload.walletId,
      },
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId is not exist', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        walletId: data.wrongpayload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `Wallet '${data.wrongpayload.walletId} not found'`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId mismatch', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({
        Item: {
          walletId: 'walletId',
          userId: 'userId',
        },
      }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        walletId: data.wrongpayload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when InternalServerError', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.reject({
        Item: {
          walletId: 'walletId',
          userId: 'userId',
        },
      }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        walletId: data.wrongpayload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {

    });
    expect(result).toEqual(expectedResult);
  });

  it('should list files with hash when correct data is provided', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({
        Item: {
          walletId: data.jwtMock.walletId,
          userId: data.jwtMock.userId,
        },
      }),
    });
    getFileSpy.mockReturnValue([
      {
        fileName: 'test file without hash',
      },
      {
        fileName: 'test file with hash',
        hash: 'hash',
      },
    ]);
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        walletId: data.jwtMock.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, [
      {
        fileName: 'test file with hash',
        hash: 'hash',
      },
    ]);
    expect(result).toEqual(expectedResult);
  });
});
