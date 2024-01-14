// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const { handler } = require('../../../lambda/deleteFolder');
const request = require('./mock/request.json');
const response = require('./mock/response.json');
const utils = require('../../../utils');

describe('Test delete-folder', () => {
  let getSpy;
  let querySpy;
  let deleteSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    querySpy = jest.spyOn(DocumentClient.prototype, 'query');
    deleteSpy = jest.spyOn(DocumentClient.prototype, 'delete');
    sinon.stub(jwt, 'verify').callsFake(() => request.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    querySpy.mockRestore();
    deleteSpy.mockRestore();
    sinon.restore();
  });

  it('should fail when authorization token is invalid', async () => {
    const result = await handler(request.invalidAuthHandlerEvent);
    const expectedResult = utils.send(
      StatusCodes.UNAUTHORIZED,
      response.invalidAuthResponse,
    );
    expect(result).toEqual(expectedResult);
  });

  it('should fail when wallet and folder ID missing', async () => {
    const result = await handler(request.invalidParamsHandlerEvent);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, response.invalidParamsResponse);

    expect(result).toEqual(expectedResult);
  });

  it('should fail when wallet is not found', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    const result = await handler(request.walletNotExistHandlerEvent);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, response.walletNotFoundResponse);

    expect(result).toEqual(expectedResult);
  });

  it('should fail when wallet is missmatch', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: { walletId: 'demo777a.testnet' } }),
    });

    const result = await handler(request.walletMissMatchHandlerEvent);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, response.walletMissmatchResponse);

    expect(result).toEqual(expectedResult);
  });

  it('should fail when folder not found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: { walletId: 'demo777.testnet' } }),
    });

    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Count: undefined }),
    });

    const result = await handler(request.folderNotExistHandlerEvent);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, response.folderNotExistResponse);

    expect(result).toEqual(expectedResult);
  });

  it('should succeed when request is valid', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: { walletId: 'demo777.testnet' } }),
    });

    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Count: 1 }),
    });

    deleteSpy.mockReturnValue({
      promise: () => Promise.resolve({}),
    });

    const result = await handler(request.validHandlerEvent);
    const expectedResult = utils.send(StatusCodes.ACCEPTED);

    expect(result).toEqual(expectedResult);
  });
});
