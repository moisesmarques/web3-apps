const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const utils = require('../../../utils');

const lambda = require('../../../list-connected-apps');

const AuthCode = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGRhdGVkIjoiMjAyMi0wMy0xNFQxNzoxMjozOC4wODBaIiwiY291bnRyeUNvZGUiOiIrNDYiLCJsYXN0TmFtZSI6ImFmemFsIiwidXNlcklkIjoicnRIRTB2X2V2TDRhWlpleG1uY2RJIiwic3RhdHVzIjoiYWN0aXZlIiwiY3JlYXRlZCI6MTY0NzAxMzQ1MzUxMSwiaXNQaG9uZVZlcmlmaWVkIjpmYWxzZSwiZW1haWwiOiJzdWZ5YW4uYWZ6YWxAcHJpbWVsYWIuaW8iLCJwaG9uZSI6IjcwMDI3NjI3NyIsImZpcnN0TmFtZSI6InN1ZnlhbiIsImlzRW1haWxWZXJpZmllZCI6ZmFsc2UsIndhbGxldE5hbWUiOiJzdWZ5YW5hZnphbC5uZWFyIiwiaWF0IjoxNjQ4NjU0NDExLCJleHAiOjE2NDg3NDA4MTF9.sDPy0movH-Zj0wBI5lFE68jMJIbCK1MGhdDWYtLeLpI';
const jwtMock = {
  lastName: 'Afzal',
  userId: '_BE_Ou5exXqW-wFLuTxud',
  status: 'active',
  created: 1646209318710,
  isPhoneVerified: false,
  email: 'sufyanafzal@gmail.com',
  firstName: 'Sufyan',
  isEmailVerified: false,
  iat: 1646327133,
  walletId: 'owner.near',
};
describe('List connected App test cases', () => {
  let getSpy;
  let querySpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    querySpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');

    sinon.stub(jwt, 'verify')
      .callsFake(() => jwtMock);
  });

  afterAll(() => {
    sinon.restore();
  });

  it('should pass when contactId is missing but userId is present', async () => {
    const Item = {
      connectionId: 'Test app',
    };

    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }),
    });
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [Item] }),
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: {

      },
      headers: { Authorization: AuthCode },
    };

    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'ContactId Not found!',
    });
    const result = await lambda.handler(event);
    expect(result).toEqual(expectedResult);
  });
  it('should fail when error from DB', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.reject('somethingWentWrong'),
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: {

      },
      headers: { Authorization: AuthCode },
    };

    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error retreiving apps from the user!',
    });
    const result = await lambda.handler(event);
    expect(result).toEqual(expectedResult);
  });

  it('should pass when contactId is present but apps not found', async () => {
    const Item = {
      contactId: 't6ZygQWwUW5YSpMZV97Tx',
      lastName: 'name',
      userId: '6eoXC666nwJVaBI25xUXU',
      isFavorite: false,
      email: [
        {
          type: 'personal',
          address: 'tr@email.com',
        },
      ],
      phone: [],
      firstName: 'test',
    };

    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [Item] }),
    });

    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [] }),
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        contactId: 't6ZygQWwUW5YSpMZV97Tx',
      },
      headers: { Authorization: AuthCode },
    };

    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'Apps Not found!', total_connected_apps: 0,
    });
    const result = await lambda.handler(event);
    expect(result).toEqual(expectedResult);
  });

  it('should pass when contactId is present and apps found', async () => {
    const contactMock = {
      contactId: 't6ZygQWwUW5YSpMZV97Tx',
      lastName: 'name',
      userId: '6eoXC666nwJVaBI25xUXU',
      isFavorite: false,
      email: [
        {
          type: 'personal',
          address: 'tr@email.com',
        },
      ],
      phone: [],
      firstName: 'test',
    };
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
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [contactMock] }),
    });

    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [appMock] }),
    });
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: { appId: '12314345455' } }),
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        contactId: 't6ZygQWwUW5YSpMZV97Tx',
      },
      headers: { Authorization: AuthCode },
    };

    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'Apps retrieved successfully!',
      data: [{ appId: '12314345455' }],
      total_connected_apps: 1,
    });
    const result = await lambda.handler(event);
    expect(result).toEqual(expectedResult);
  });
  it('should pass when contactId is not present but userId found', async () => {
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
    const userMock = {
      userId: 'userId',
    };
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [userMock] }),
    });
    querySpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Items: [appMock] }),
    });
    getSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Item: { appId: '12314345455' } }),
    });

    const event = {
      httpMethod: 'GET',
      queryStringParameters: null,
      headers: { Authorization: AuthCode },
    };

    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'Apps retrieved successfully!',
      data: [{ appId: '12314345455' }],
      total_connected_apps: 1,
    });
    const result = await lambda.handler(event);
    expect(result).toEqual(expectedResult);
  });

  it('should fail when token is missing', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {},
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error retreiving apps from the user!',
      data: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when jwt is not valid', async () => {
    sinon.restore();
    const event = {
      httpMethod: 'GET',
      headers: {
        Authorization: 'myToken',
      },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
      message: 'Error retreiving apps from the user!',
      data: 'invalid token',
    });
    expect(result).toEqual(expectedResult);
  });
});
