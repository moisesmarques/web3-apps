// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const { handler } = require('../../../lambda/acceptShare');
const utils = require('../../../utils');
const request = require('./mock/request.json');
const response = require('./mock/response.json');

describe('Test accept-share', () => {
  let getSpy;
  let updateSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    updateSpy = jest.spyOn(DocumentClient.prototype, 'update');
    sinon.stub(jwt, 'verify').callsFake(() => request.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    updateSpy.mockRestore();
    sinon.restore();
  });

  it('should fail when authorization token invalid', async () => {
    const result = await handler(request.invalidAuthHandlerEvent);
    const expectedResult = utils.send(
      StatusCodes.UNAUTHORIZED,
      response.invalidAuthResponse,
    );

    expect(result).toEqual(expectedResult);
  });

  it('should fail when wallet not found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    const result = await handler(request.walletNotExistHandlerEvent);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, response.walletNotFoundResponse);

    expect(result).toEqual(expectedResult);
  });

  it('should fail when wallet missmatch', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: { walletId: 'dev1.near', userId: 'user1' } }),
    });

    const result = await handler(request.walletMissMatchHandlerEvent);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, response.walletMissmatchResponse);

    expect(result).toEqual(expectedResult);
  });

  it('should fail when file not found', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: { walletId: 'demo777.testnet', userId: 'jPGd_Wg8FfVVKsdBu5Iv2' } }),
    }).mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    const result = await handler(request.fileNotExistHandlerEvent);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, response.fileNotExistResponse);

    expect(result).toEqual(expectedResult);
  });

  it('should fail when file already shared', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: { walletId: 'demo777.testnet', userId: 'jPGd_Wg8FfVVKsdBu5Iv2' } }),
    }).mockReturnValue({
      promise: () => Promise.resolve({ Item: { sharedAt: '2022-03-31T10:13:46.503Z', acceptedAt: '2022-03-31T10:13:46.503Z' } }),
    });

    const result = await handler(request.fileAlreadySharedHandlerEvent);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, response.fileAlreadySharedResponse);

    expect(result).toEqual(expectedResult);
  });

  it('should succeed when request is valid', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: { walletId: 'demo777.testnet', userId: 'jPGd_Wg8FfVVKsdBu5Iv2' } }),
    }).mockReturnValue({
      promise: () => Promise.resolve({ Item: {} }),
    });

    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });

    const result = await handler(request.validHandlerEvent);
    const expectedResult = utils.send(StatusCodes.OK, {});
    expect(result).toEqual(expectedResult);
  });
});
