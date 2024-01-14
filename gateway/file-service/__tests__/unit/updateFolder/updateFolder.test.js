/* eslint-disable no-undef */
// @ts-nocheck
const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const BPromise = require('bluebird');
const lambda = require('../../../lambda/updateFolder/index');
const utils = require('../../../utils');
const data = require('./mock/request.json');

describe('Test update folder', () => {
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

  it('should fail when name is not string', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        name: 1234,
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid or missing.',
      data: ['"name" must be a string'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when name don\'t match pattern', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        name: 'abcd_+=?#',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid or missing.',
      data: ['Folder name includes invalid character'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when name is less than 1 char', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        name: '',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid or missing.',
      data: ['"name" is not allowed to be empty'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when parentFolderId is not string', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        name: 'abcd',
        parentFolderId: 1234,
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid or missing.',
      data: ['"parentFolderId" must be a string'],
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when description is not string', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      body: JSON.stringify({
        name: 'abcd',
        parentFolderId: 'parentFolderId',
        description: 1234,
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid or missing.',
      data: ['"description" must be a string'],
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
        name: 'abcd',
        parentFolderId: 'parentFolderId',
        description: 'This is a test description',
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
        name: 'abcd',
        parentFolderId: 'parentFolderId',
        description: 'This is a test description',
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
        name: 'abcd',
        parentFolderId: 'parentFolderId',
        description: 'This is a test description',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Wallet associated with user mismatch with stored wallet',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no folder is found', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Item: {
          walletId: data.jwtMock.walletId,
          userId: data.jwtMock.userId,
        },
      }),
    });
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
        name: 'abcd',
        parentFolderId: 'parentFolderId',
        description: 'This is a test description',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: `No folder '${data.payload.folderId}' found`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no folder is associated with the wallet', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Item: {
          walletId: data.jwtMock.walletId,
          userId: data.jwtMock.userId,
        },
      }),
    });
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [{
          walletId: data.wrongpayload.userId,
        }],
      }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [{
          walletId: data.wrongpayload.userId,
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
        name: 'abcd',
        parentFolderId: 'parentFolderId',
        description: 'This is a test description',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: `No folder '${data.payload.folderId}' associated with this '${data.payload.walletId}' wallet`,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when no parent folder', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Item: {
          walletId: data.jwtMock.walletId,
          userId: data.jwtMock.userId,
        },
      }),
    });
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [{
          walletId: data.payload.walletId,
        }],
      }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [],
      }),
    });
    // updateSpy.mockReturnValueOnce({
    //   promise: () => Promise.resolve({
    //     Attributes: {
    //       name: 'abcd',
    //       parentFolderId: 'parentFolderId',
    //       description: 'This is a test description',
    //     },
    //   }),
    // });
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
        name: 'abcd',
        parentFolderId: 'parentFolderId',
        description: 'This is a test description',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'No parent folder \'parentFolderId\' found',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should success when proper value is provided', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Item: {
          walletId: data.jwtMock.walletId,
          userId: data.jwtMock.userId,
        },
      }),
    });
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [{
          walletId: data.payload.walletId,
        }],
      }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [{
          walletId: data.payload.walletId,
        }],
      }),
    });
    updateSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Attributes: {
          name: 'abcd',
          parentFolderId: 'parentFolderId',
          description: 'This is a test description',
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
        name: 'abcd',
        parentFolderId: 'parentFolderId',
        description: 'This is a test description',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = {
      message: 'Folder updated successfully',
      updateFolder: {
        name: 'abcd',
        parentFolderId: 'parentFolderId',
        description: 'This is a test description',
      },
    };
    expect(result).toEqual(expectedResult);
  });

  it('should success when proper value is provided and parentFolder is root', async () => {
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Item: {
          walletId: data.jwtMock.walletId,
          userId: data.jwtMock.userId,
        },
      }),
    });
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [{
          walletId: data.payload.walletId,
        }],
      }),
    }).mockReturnValueOnce({
      promise: () => Promise.resolve({
        Items: [{
          walletId: data.payload.walletId,
        }],
      }),
    });
    updateSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({
        Attributes: {
          name: 'abcd',
          parentFolderId: 'root',
          description: 'This is a test description',
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
        name: 'abcd',
        description: 'This is a test description',
      }),
    };
    const result = await lambda.handler(event);
    const expectedResult = {
      message: 'Folder updated successfully',
      updateFolder: {
        name: 'abcd',
        parentFolderId: 'root',
        description: 'This is a test description',
      },
    };
    expect(result).toEqual(expectedResult);
  });
});
