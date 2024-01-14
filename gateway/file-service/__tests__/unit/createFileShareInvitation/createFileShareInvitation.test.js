/* eslint-disable no-undef */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const BPromise = require('bluebird');
const lambda = require('../../../lambda/createFileShareInvitation/index');
const utils = require('../../../utils');
const data = require('./mock/request.json');

describe('Test create file share invitation', () => {
  let getSpy;
  let updateSpy;
  let putSpy;
  let querySpy;
  let sendEmailSpy;
  let sendSMSSpy;
  let bpromiseMapSpy;
  beforeAll(() => {
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    updateSpy = jest.spyOn(DocumentClient.prototype, 'update');
    putSpy = jest.spyOn(DocumentClient.prototype, 'put');
    querySpy = jest.spyOn(DocumentClient.prototype, 'query');
    sendEmailSpy = jest.spyOn(utils, 'sendEmail');
    sendSMSSpy = jest.spyOn(utils, 'sendSMS');
    bpromiseMapSpy = jest.spyOn(BPromise, 'map');
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock);
  });

  afterAll(() => {
    getSpy.mockRestore();
    updateSpy.mockRestore();
    putSpy.mockRestore();
    querySpy.mockRestore();
    sendEmailSpy.mockRestore();
    sendSMSSpy.mockRestore();
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
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Unexpected token u in JSON at position 0',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when body is not valid JSON', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: '{',
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Unexpected end of JSON input',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when inviteeChannel is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        inviteeAddress: 'asdf',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid.',
      data: ['"inviteeChannel" is required'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when inviteeChannel is not string', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        inviteeChannel: 1234,
        inviteeAddress: 'asdf',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid.',
      data: [
        '"inviteeChannel" must be one of [email, phone]',
        '"inviteeChannel" must be a string',
      ],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when inviteeChannel is not one of [email, phone]', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        inviteeChannel: 'letter',
        inviteeAddress: 'asdf',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid.',
      data: ['"inviteeChannel" must be one of [email, phone]'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when inviteeAddress is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        inviteeChannel: 'email',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid.',
      data: ['"inviteeAddress" is required'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when inviteeAddress is not a string', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        inviteeChannel: 'email',
        inviteeAddress: 1234,
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid.',
      data: ['"inviteeAddress" must be a string'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when auth is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.folderId,
        walletId: data.payload.walletId,
      },
      body: JSON.stringify({
        inviteeChannel: 'email',
        inviteeAddress: 'testemail@example.com',
      }),
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'You are not authenticated',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when file not found', async () => {
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [
          {
            walletId: 'asdf',
          },
        ],
      }),
    });
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [],
      }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.folderId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        inviteeChannel: 'email',
        inviteeAddress: 'testemail@example.com',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `No file '${data.payload.folderId}' associated with this wallet`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should pass when user already exists', async () => {
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [
          {
            walletId: 'asdf',
            userId: 'asdf',
          },
        ],
      }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [
          {
            walletId: 'inviteeWalletId.near',
          },
        ],
      }),
    });
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Item: [{
          fileId: data.payload.folderId,
        }],
      }),
    });
    updateSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Attributes: {
          fileId: data.payload.folderId,
          walletId: data.payload.walletId,
          inviteeAddress: '',
          inviteeChannel: '',
        },
      }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.folderId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        inviteeChannel: 'email',
        inviteeAddress: 'testemail@example.com',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      fileId: data.payload.folderId,
      walletId: data.payload.walletId,
      inviteeAddress: '',
      inviteeChannel: '',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should send email when user doesn\'t exists and inviteeChannel is email', async () => {
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [
          {
            walletId: 'asdf',
          },
        ],
      }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [
          {
            walletId: 'inviteeWalletId.near',
          },
        ],
      }),
    });
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Item: [{
          fileId: data.payload.folderId,
        }],
      }),
    });
    updateSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Attributes: {
          fileId: data.payload.folderId,
          walletId: data.payload.walletId,
          inviteeAddress: '',
          inviteeChannel: '',
        },
      }),
    });
    putSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Attributes: {
          fileId: data.payload.folderId,
          walletId: data.payload.walletId,
          inviteeAddress: '',
          inviteeChannel: '',
        },
      }),
    });
    sendEmailSpy.mockResolvedValueOnce(true);
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.folderId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        inviteeChannel: 'email',
        inviteeAddress: 'testemail@example.com',
      }),
    };
    await lambda.handler(event);
    expect(sendEmailSpy).toHaveBeenCalled();
  });

  it('should send sms when user doesn\'t exists and inviteeChannel is phone', async () => {
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [
          {
            walletId: 'asdf',
          },
        ],
      }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [
          {
            walletId: 'inviteeWalletId.near',
          },
        ],
      }),
    });
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Item: [{
          fileId: data.payload.folderId,
        }],
      }),
    });
    updateSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Attributes: {
          fileId: data.payload.folderId,
          walletId: data.payload.walletId,
          inviteeAddress: '',
          inviteeChannel: '',
        },
      }),
    });
    putSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Attributes: {
          fileId: data.payload.folderId,
          walletId: data.payload.walletId,
          inviteeAddress: '',
          inviteeChannel: '',
        },
      }),
    });
    sendSMSSpy.mockResolvedValueOnce(true);
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        fileId: data.payload.folderId,
        walletId: data.payload.walletId,
      },
      headers: {
        Authorization: data.AuthCode,
      },
      body: JSON.stringify({
        inviteeChannel: 'phone',
        inviteeAddress: 'testemail@example.com',
      }),
    };
    await lambda.handler(event);
    expect(sendSMSSpy).toHaveBeenCalled();
  });
});
