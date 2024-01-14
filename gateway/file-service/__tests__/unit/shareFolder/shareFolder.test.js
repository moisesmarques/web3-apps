/* eslint-disable no-undef */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const BPromise = require('bluebird');
const lambda = require('../../../lambda/shareFolder/index');
const utils = require('../../../utils');
const data = require('./mock/request.json');

describe('Test share folder', () => {
  let getSpy;
  let updateSpy;
  let querySpy;
  let bpromiseMapSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    updateSpy = jest.spyOn(DocumentClient.prototype, 'update');
    querySpy = jest.spyOn(DocumentClient.prototype, 'query');
    bpromiseMapSpy = jest.spyOn(BPromise, 'map');
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    updateSpy.mockRestore();
    querySpy.mockRestore();
    bpromiseMapSpy.mockRestore();
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
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Invalid JSON Body',
      data: {},
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when receiverIds is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { folderId: 'folderId' },
      body: JSON.stringify({}),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'receiverIds missing in the request!',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when receiverIds is not valid array', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { folderId: 'folderId' },
      body: JSON.stringify({
        receiverIds: 'receiverIds',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: '"receiverIds" should be a valid array',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when auth is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        folderId: data.payload.folderId,
        walletId: data.payload.walletId,
      },
      body: JSON.stringify({
        receiverIds: ['receiverId1'],
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
        folderId: data.payload.folderId,
        walletId: data.wrongpayload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        receiverIds: ['receiverId1'],
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `Wallet '${data.wrongpayload.walletId} not found'`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when walletId mismatch', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: { walletId: 'walletId' } }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        folderId: data.payload.folderId,
        walletId: data.wrongpayload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        receiverIds: ['receiverId1'],
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no receiver wallet is found', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Item: {
          walletId: data.payload.walletId,
          userId: data.jwtMock.userId,
        },
      }),
    });
    bpromiseMapSpy.mockResolvedValueOnce([]);
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        folderId: data.payload.folderId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        receiverIds: ['receiverId1'],
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Receiver wallet not found',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no folder is associated with the wallet', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Item: {
          walletId: data.payload.walletId,
          userId: data.jwtMock.userId,
        },
      }),
    });
    bpromiseMapSpy.mockResolvedValueOnce([{
      ownerId: data.jwtMock.userId,
      walletId: data.payload.walletId,
    }]);
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [] }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        folderId: data.payload.folderId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        receiverIds: ['receiverId1'],
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `No folder '${data.payload.folderId}' associated with this wallet`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when folder has different owner', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Item: {
          walletId: data.payload.walletId,
          userId: data.jwtMock.userId,
        },
      }),
    });
    bpromiseMapSpy.mockResolvedValueOnce([{
      ownerId: data.jwtMock.userId,
      walletId: data.payload.walletId,
    }]);
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [{
          ownerId: data.wrongpayload.userId,
        }],
      }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        folderId: data.payload.folderId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        receiverIds: ['receiverId1'],
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authorized to perform this operation',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should success when proper value is passed', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Item: {
          walletId: data.payload.walletId,
          userId: data.jwtMock.userId,
        },
      }),
    });
    bpromiseMapSpy.mockResolvedValueOnce([{
      ownerId: data.jwtMock.userId,
      walletId: data.payload.walletId,
    }]);
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [{
          ownerId: data.payload.walletId,
        }],
      }),
    });
    updateSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Attributes: {
          walletId: data.payload.walletId,
          userId: data.jwtMock.userId,
        },
      }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        folderId: data.payload.folderId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        receiverIds: ['receiverId1'],
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = {
      message: 'Folder shared successfully',
    };
    expect(result).toEqual(expectedResult);
  });
});
