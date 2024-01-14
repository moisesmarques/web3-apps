const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const S3 = require('aws-sdk/clients/s3');
const sinon = require('sinon');
const data = require('./mock/request.json');

const lambda = require('../../../lambda/transferOwnership/index');
const utils = require('../../../utils');

jest.mock('aws-sdk/clients/s3');

describe('Test transferOwnership lambda', () => {
  let getSpy;
  let getFileSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    getFileSpy = jest.fn(() => {});
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    sinon.restore();
  });

  it('should fail when auth is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        walletId: data.payload.walletId,
        fileId: data.payload.fileId,
      },
      body: JSON.stringify({ receiverId: 'receiverId' }),
      headers: {},
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when receiverId is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        walletId: data.payload.walletId,
        fileId: data.payload.fileId,
      },
      body: JSON.stringify({ }),
      headers: {},
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'receiverId missing in the request!',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when wallet not found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        walletId: data.payload.walletId,
        fileId: data.payload.fileId,
      },
      body: JSON.stringify({ receiverId: 'receiverId' }),
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `Wallet '${data.payload.walletId} not found'`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when wallet mismatch', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: { userId: data.jwtMock.userId, walletId: data.wrongpayload.walletId } }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        walletId: data.payload.walletId,
        fileId: data.payload.fileId,
      },
      body: JSON.stringify({ receiverId: 'receiverId' }),
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no file associated with walletId', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: { userId: data.jwtMock.userId, walletId: data.jwtMock.walletId } }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: { userId: data.jwtMock.userId, walletId: data.jwtMock.walletId } }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        walletId: data.payload.walletId,
        fileId: data.payload.fileId,
      },
      body: JSON.stringify({ receiverId: 'receiverId' }),
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'No file \'f68c1ebd-1110-436e-821a-70fc3d6f58b3\' associated with this wallet',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no file associated with walletId', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: { userId: data.jwtMock.userId, walletId: data.jwtMock.walletId } }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: { userId: data.jwtMock.userId, walletId: data.jwtMock.walletId } }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        walletId: data.payload.walletId,
        fileId: data.payload.fileId,
      },
      body: JSON.stringify({ receiverId: 'receiverId' }),
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'No file \'f68c1ebd-1110-436e-821a-70fc3d6f58b3\' associated with this wallet',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when InternalServerError', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.reject({ Item: { userId: data.jwtMock.userId, walletId: data.jwtMock.walletId } }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: { userId: data.jwtMock.userId, walletId: data.jwtMock.walletId } }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: data.file }),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: {
        walletId: data.payload.walletId,
        fileId: data.payload.fileId,
      },
      body: JSON.stringify({ receiverId: 'receiverId' }),
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
    });
    expect(result).toEqual(expectedResult);
  });
});
