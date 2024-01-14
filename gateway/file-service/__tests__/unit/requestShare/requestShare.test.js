/* eslint-disable no-undef */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const lambda = require('../../../lambda/requestShare/index');
const utils = require('../../../utils');
const data = require('./mock/request.json');

describe('Test request share', () => {
  let getSpy;
  let updateSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    updateSpy = jest.spyOn(DocumentClient.prototype, 'update');
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    updateSpy.mockRestore();
    sinon.restore();
  });

  it('should fail when pathParameter is missing', async () => {
    const event = {
      httpMethod: 'GET',
    };
    // const result = await lambda.handler(event);
    try {
      await lambda.handler(event);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should fail when body is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Unexpected token u in JSON at position 0',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when requesterId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { fileId: 'fileId' },
      body: JSON.stringify({}),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'requesterId missing in the request!',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when auth is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.payload.walletId,
      },
      body: JSON.stringify({
        requesterId: 'requesterId',
      }),
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId is not exist', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [] }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.wrongpayload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        requesterId: 'requesterId',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `Wallet '${data.wrongpayload.walletId} not found'`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when receiver Wallet now found', async () => {
    getSpy
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: { walletId: 'walletId' } }),
      })
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: null }),
      });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.wrongpayload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        requesterId: 'requesterId',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `Wallet '${'requesterId'} not found'`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId mismatch', async () => {
    getSpy
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: { walletId: 'walletId' } }),
      })
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: { walletId: 'requesterId' } }),
      });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.wrongpayload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        requesterId: 'requesterId',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when file not found', async () => {
    getSpy
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: { walletId: 'titusWallet.near' } }),
      })
      .mockReturnValueOnce({
        promise: () => Promise.resolve({
          Item: {
            walletId: data.payload.walletId,
            userId: data.jwtMock.userId,
          },
        }),
      })
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: undefined }),
      });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        requesterId: 'requesterId',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `No file '${data.payload.fileId}' associated with this wallet`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should should success when proper value is provided', async () => {
    getSpy
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: { walletId: 'titusWallet.near' } }),
      })
      .mockReturnValueOnce({
        promise: () => Promise.resolve({
          Item: {
            walletId: data.payload.walletId,
            userId: data.jwtMock.userId,
          },
        }),
      })
      .mockReturnValueOnce({
        promise: () => Promise.resolve({ Item: { fileId: 'fileId' } }),
      });
    updateSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Attributes: { fileId: 'fileId' } }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.fileId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        requesterId: 'requesterId',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      fileId: 'fileId',
    });
    expect(result).toEqual(expectedResult);
  });
});
