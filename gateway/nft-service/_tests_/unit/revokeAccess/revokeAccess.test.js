/* eslint-disable no-unused-vars */
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
// eslint-disable-next-line no-unused-vars
const { StatusCodes } = require('http-status-codes');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const responseAccessUtils = require('../../../lib/model/requestAccess');

const lambda = require('../../../revokeAccess');
const utils = require('../../../utils');
const data = require('./mock/request');

describe('Test nft revoke nft access', () => {
  let verifyAccessTokenSpy;
  let getSpy;
  let querySpy;
  let putSpy;
  let updateSpy;
  let deleteSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    querySpy = jest.spyOn(DocumentClient.prototype, 'query');
    putSpy = jest.spyOn(DocumentClient.prototype, 'put');
    updateSpy = jest.spyOn(DocumentClient.prototype, 'update');
    deleteSpy = jest.spyOn(DocumentClient.prototype, 'delete');
    verifyAccessTokenSpy = jest.spyOn(utils, 'verifyAccessToken');
    sinon.stub(jwt, 'verify').callsFake((req, res, next) => data.jwtMock);
  });

  // Clean up mocks
  afterAll(() => {
    putSpy.mockRestore();
    getSpy.mockRestore();
    querySpy.mockRestore();
    updateSpy.mockRestore();
    verifyAccessTokenSpy.mockRestore();
  });

  // it('should fail when token is missing/invalid/expired', async () => {
  //   const event = {
  //     httpMethod: 'POST',
  //     pathParameters: { requestId: 'mm1sxa55fwwf' },
  //     headers: {

  //     },
  //   };
  //   const result = await lambda.handler(event);
  //   console.log(result);

  //   const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
  //     message: 'Access token is required',
  //   });
  //   console.log(expectedResult);
  //   expect(JSON.parse(result.body)).toEqual(
  //     JSON.parse(expectedResult.body),
  //   );
  // });

  it('should fail when path parameter requestId is missing', async () => {
    verifyAccessTokenSpy.mockReturnValue({
      promise: () => Promise.resolve(data.jwtMock),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: { action: 'accept' },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);
    console.log(result.body);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "requestId" is required.',
    });
    console.log(expectedResult.body);

    expect(result.body).toEqual(expectedResult.body);
  });

  it('should fail when requestId is not found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const accessToken = await jwt.sign(data.jwtMock, 'testkeys', {
      expiresIn: 3600,
    });

    const event = {
      httpMethod: 'POST',
      pathParameters: { requestId: 'mm1sxa55fwwf', action: 'accept' },
      headers: {
        Authorization: accessToken,
      },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message:
        'There is no Access request associated with the provided `requestId`.',
    });

    expect(result.body).toEqual(expectedResult.body);
  });

  it('should fail when request owner id is not the logged in user walletId', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.requestItem }),
    });
    const accessToken = await jwt.sign(data.jwtMock, 'testkeys', {
      expiresIn: 3600,
    });

    const event = {
      httpMethod: 'POST',
      pathParameters: { requestId: 'mm1sxa55fwwf' },
      headers: {
        Authorization: accessToken,
      },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'User does not have access to the Request',
    });

    expect(result.body).toEqual(expectedResult.body);
  });

  it('should fail when there is no shared Nft ', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    const accessToken = await jwt.sign(data.jwtMock, 'testkeys', {
      expiresIn: 3600,
    });

    const event = {
      httpMethod: 'POST',
      pathParameters: { requestId: 'mm1sxa55fwwf' },
      headers: {
        Authorization: accessToken,
      },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message:
        'There is no Access request associated with the provided `requestId`.',
    });

    expect(result.body).toEqual(expectedResult.body);
  });

  it('should update the access request status', async () => {
    verifyAccessTokenSpy.mockReturnValue(data.jwtMock);
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.requestPending }),
    });
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [{ Item: data.nftShare }] }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.responseItem }),
    });
    deleteSpy.mockReturnValue({
      promise: () => Promise.resolve(true),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: { requestId: 'mm1sxa55fwwf' },
      headers: {
        Authorization: '',
      },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'Shared nft access revoked successfully.',
    });

    expect(result.body).toEqual(expectedResult.body);
  });

  it('should update the access request status', async () => {
    verifyAccessTokenSpy.mockReturnValue(data.jwtMock);
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.requestPending }),
    });
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: undefined }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.responseItem }),
    });
    deleteSpy.mockReturnValue({
      promise: () => Promise.resolve(true),
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: { requestId: 'mm1sxa55fwwf' },
      headers: {
        Authorization: '',
      },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'There is no shared Nft associated with the provided details.',
    });

    expect(result).toEqual(expectedResult);
  });
});
