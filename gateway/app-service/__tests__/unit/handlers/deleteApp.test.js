const { StatusCodes } = require('http-status-codes');
const lambda = require('../../../delete');
const utils = require('../../../utils');
const { deleteApp, getApp } = require('../../../lib/model/deleteApp');

const AuthCode = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsYXN0TmFtZSI6Iktpdml0ZSIsInVzZXJJZCI6Il9CRV9PdTVleFhxVy13Rkx1VHh1ZCIsInN0YXR1cyI6ImFjdGl2ZSIsImNyZWF0ZWQiOjE2NDYyMDkzMTg3MTAsImlzUGhvbmVWZXJpZmllZCI6ZmFsc2UsImVtYWlsIjoidGtpdml0ZUBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJUaXR1cyIsImlzRW1haWxWZXJpZmllZCI6ZmFsc2UsIndhbGxldE5hbWUiOiJ0aXR1c1dhbGxldC5uZWFyIiwiaWF0IjoxNjQ2MzI3MTMzLCJleHAiOjE2NDY0MTM1MzN9.PFA57GwzBuIM8O04XICee1xFTciApptbDCGTjTWPtyU';
const appId = 'DGWS4dPa8dejsDNMMlwzg';

jest.mock('../../../lib/model/deleteApp', () => ({ deleteApp: jest.fn(), getApp: jest.fn() }));

describe('Test deletApp test case', () => {
  // let getSpy;
  let verifyAccessTokenSpy;
  beforeAll(() => {
    // getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    verifyAccessTokenSpy = jest.spyOn(utils, 'verifyAccessToken');
  });

  // Clean up mocks
  afterAll(() => {
    verifyAccessTokenSpy.mockRestore();
  });

  it('should fail when token is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        appId,
      },
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error in delete App',
      data: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when appId is missing on path param', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      headers: { Authorization: AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Missing appId path param',
      data: {},
    });
    expect(result).toEqual(expectedResult);
  });
  it('should pass when appId is provided in path param', async () => {
    const appMock = {
      appId: '79l_-4LplTxW4D4YBNSIM',
      appIcon: 'https://i.ibb.co/GCkfrGn/Screenshot-2022-03-24-at-5-39-45-PM.png',
      appName: 'Web3Cloud',
      version: '3',
      updated: 1647987630453,
      developer: 'Abdo',
      categoryId: 'XNwyaIOPKkfc1iFngXorm',
      created: 1647987630453,
      description: 'Test description',
      ownerId: '147782bc-3124-451f-9f57-ba1f3d731807',
      tags: [
        'tag1',
        'tag2',
      ],
    };
    getApp.mockResolvedValueOnce(appMock);
    deleteApp.mockResolvedValueOnce({});
    verifyAccessTokenSpy.mockReturnValue({});
    const event = {
      httpMethod: 'DELETE',
      pathParameters: {
        appId: '79l_-4LplTxW4D4YBNSIM',
      },
      headers: { Authorization: AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'App deleted successfully.',
    });
    expect(result).toEqual(expectedResult);
  });
  it('should fail when app not found', async () => {
    getApp.mockResolvedValueOnce(undefined);
    verifyAccessTokenSpy.mockReturnValue({});
    const event = {
      httpMethod: 'DELETE',
      pathParameters: {
        appId: '79l_-4LplTxW4D4YBNSIM',
      },
      headers: { Authorization: AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'APP not found. Please check your app id',
    });
    expect(result).toEqual(expectedResult);
  });
  it('should fail when get error from DB', async () => {
    getApp.mockRejectedValueOnce({ code: 'SomeCode' });
    verifyAccessTokenSpy.mockReturnValue({});
    const event = {
      httpMethod: 'DELETE',
      pathParameters: {
        appId: '79l_-4LplTxW4D4YBNSIM',
      },
      headers: { Authorization: AuthCode },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error in delete App',
    });
    expect(result).toEqual(expectedResult);
  });
});
