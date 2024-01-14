/* eslint-disable no-unused-vars */
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
// eslint-disable-next-line no-unused-vars
const { StatusCodes } = require('http-status-codes');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const responseAccessUtils = require('../../../lib/model/requestAccess');

const lambda = require('../../../responseAccess');
const utils = require('../../../utils');
const data = require('./mock/request');

describe('Test nft access request response', () => {
  let verifyAccessTokenSpy;
  let getSpy;
  let putSpy;
  let updateSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    putSpy = jest.spyOn(DocumentClient.prototype, 'put');
    updateSpy = jest.spyOn(DocumentClient.prototype, 'update');
    verifyAccessTokenSpy = jest.spyOn(utils, 'verifyAccessToken');
    sinon
      .stub(jwt, 'verify')
      .callsFake((req, res, next) => data.jwtMock);
  });

  // Clean up mocks
  afterAll(() => {
    putSpy.mockRestore();
    getSpy.mockRestore();
    updateSpy.mockRestore();
    verifyAccessTokenSpy.mockRestore();
  });
  it('should fail when path parameter requestId is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { action: 'accept' },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "requestId" is required.',
    });

    expect(JSON.parse(result.body).message).toEqual(
      JSON.parse(expectedResult.body).message,
    );
  });
  it('should fail when path parameter action is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { requestId: 'mm1sxa55fwwf' },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "action" is required.',
    });

    expect(JSON.parse(result.body).message).toEqual(
      JSON.parse(expectedResult.body).message,
    );
  });
  it('should fail when action is not in allowed list', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { requestId: 'mm1sxa55fwwf', action: 'decline' },
      headers: {
        Authorization: data.AuthCode,
      },
    };
    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "action" is invalid.',
    });

    expect(JSON.parse(result.body).message).toEqual(
      JSON.parse(expectedResult.body).message,
    );
  });

  it('should fail when token is missing/invalid/expired', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: { requestId: 'mm1sxa55fwwf', action: 'accept' },
      headers: {
        Authorization: '',
      },
    };
    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error performing action',
      data: 'invalid token',
    });

    expect(JSON.parse(result.statusCode)).toEqual(
      JSON.parse(expectedResult.statusCode),
    );
    expect(JSON.parse(result.body).message).toEqual(
      JSON.parse(expectedResult.body).message,
    );

    expect(JSON.parse(result.body).data).toEqual(
      JSON.parse(expectedResult.body).data,
    );
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
      message: 'There is no Request associated with given id.',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });
  it('should fail when request owner id is the the logged in user walletId', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.requestItem }),
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
      message: 'User does not have access to this Request',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when request status is not pending', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.requestNotPending }),
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
      message: 'You have already made decision on this Request.',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should update the request status', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.requestPending }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.responseItem }),
    });
    const accessToken = await jwt.sign(data.jwtMock, 'testkeys', {
      expiresIn: 3600,
    });
    const event = {
      httpMethod: 'POST',
      pathParameters: { requestId: 'mm1sxa55fwwf', action: 'reject' },
      headers: {
        Authorization: accessToken,
      },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'Access request updated successfully.',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should update the request status and creat sharedNft if action=accept', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.requestPending }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.responseItem }),
    });
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.putNftShare }),
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

    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'Access request updated successfully.',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });
});
