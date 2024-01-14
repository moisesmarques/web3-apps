/* eslint-disable linebreak-style */
// @ts-nocheck
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const { StatusCodes } = require('http-status-codes');
const lambda = require('../../../lambda/grantAccessPermission/index');
const user = require('../../../user');
const files = require('../../../src/models/files');
const wallets = require('../../../src/models/wallets');
const data = require('./mock/request.json');
const response = require('./mock/response.json');
const { verifyUser } = require('../../../user');
const utils = require('../../../utils');

describe('Test grantAccessPermission', () => {
  let verifyAccessTokenSpy;
  let getWalletSpy;
  let getFileSpy;
  let updateSpy;

  beforeAll(() => {
    getWalletSpy = jest.spyOn(wallets, 'getWallet');
    getFileSpy = jest.spyOn(files, 'getFile');
    updateSpy = jest.spyOn(files, 'upsertFile');
    verifyAccessTokenSpy = jest.spyOn(user, 'verifyUser');
    // eslint-disable-next-line no-unused-vars
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock);
  });

  it('should fail when payload is invalid', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: data.pathParameters,
      body: undefined,
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Invalid JSON Body',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when access is missing', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: data.pathParameters,
      body: JSON.stringify(data.payloadWithoutAccess),
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'access missing in the request!',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when access is not proper', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: data.pathParameters,
      body: JSON.stringify(data.payloadWithWrongAccess),
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Invalid access type provided',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when receiverIds is missing or not an array', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: data.pathParameters,
      body: JSON.stringify(data.emptyPayload),
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The request attribute receiversIds is missing or not an array.',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when authorization token is invalid/missing/expired', async () => {
    const event = {
      httpMethod: 'POST',
      pathParameters: data.pathParameters,
      body: JSON.stringify(data.payload),
      headers: { Authorization: '' },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when wallet is not found', async () => {
    getWalletSpy.mockReturnValue(null);

    const event = {
      httpMethod: 'POST',
      pathParameters: data.pathParameters,
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'Wallet not found',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when there is wallet mismatch', async () => {
    getWalletSpy.mockReturnValue(data.diffWallet);

    const event = {
      httpMethod: 'POST',
      pathParameters: data.pathParameters,
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when fileId is invalid', async () => {
    getFileSpy.mockReturnValue(null);
    getWalletSpy.mockReturnValue(data.wallet);

    const event = {
      httpMethod: 'POST',
      pathParameters: data.pathParameters,
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `No file '${data.pathParameters.fileId}' associated with this wallet`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when user is not the file owner ', async () => {
    getFileSpy.mockReturnValue({});
    getWalletSpy.mockReturnValue(data.wallet);

    const event = {
      httpMethod: 'POST',
      pathParameters: data.pathParameters,
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Only the owner can share the file',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should succeed when request is valid', async () => {
    getFileSpy.mockReturnValue(data.file);
    getWalletSpy.mockReturnValue(data.wallet);
    updateSpy.mockReturnValue(response[0]);
    verifyAccessTokenSpy.mockReturnValue(data.jwtMock);

    const event = {
      httpMethod: 'POST',
      pathParameters: data.pathParameters,
      body: JSON.stringify(data.payload),
      headers: { Authorization: data.AuthCode },
    };

    const result = await lambda.handler(event);

    expect(JSON.parse(result.body)).toEqual(response);
  });
});
