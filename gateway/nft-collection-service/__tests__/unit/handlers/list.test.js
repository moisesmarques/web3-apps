/* eslint-disable no-undef */

const dynamodb = require('aws-sdk/clients/dynamodb');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const sinon = require('sinon');
const lambda = require('../../../list');
const utils = require('../../../utils');
const mock = require('./mock.json');

describe('Test Collection list by ownerId without authorization', () => {
  it('should fail when auth is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      headers: {},
      body: {},
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: '{"message":"invalid token"}',
    });

    const expectedResultBody = JSON.parse(expectedResult.body);

    expect(result).toEqual(expectedResultBody);
  });
});

describe('Test Collection list by ownerId with authorization', () => {
  let getSpy;

  beforeAll(() => {
    // It is just the way to bypass the DynamoDB oprations during Test Case
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');

    // It is just the way to bypass the JWT oprations during Test Case
    sinon.stub(jwt, 'verify').callsFake(() => mock.user);
  });

  // Clean up mocks
  afterAll(() => {
    sinon.restore();
    getSpy.mockRestore();
  });

  it('should fail when validation is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      headers: {
        Authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3VudHJ5Q29kZSI6IisxIiwibGFzdE5hbWUiOiJOYW1lIiwidXNlcklkIjoiMThrVDBpeWFRekM1SzRCZHV5ZThzIiwic3RhdHVzIjoiYWN0aXZlIiwiY3JlYXRlZCI6MTY0NjIzNjM1Njk4NSwiaXNQaG9uZVZlcmlmaWVkIjpmYWxzZSwicGhvbmUiOiIzMDcyMTUzNjU5IiwiZmlyc3ROYW1lIjoiVGVzdCIsImlzRW1haWxWZXJpZmllZCI6ZmFsc2UsIndhbGxldE5hbWUiOiJkYXZpdC5uZWFyIiwiaWF0IjoxNjQ3MjgwODQ3LCJleHAiOjE2NDczNjcyNDd9.GkcD3HCxQKm416dCeNVjlkjMAyQZNq6XNgRuUYAEujE',
      },
      body: '{"collectionName": "","ownerId": ""}',
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "ownerId" is required.',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should list nft-collection', async () => {
    const item = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: '{"message": "NFT Collections retrieved successfully."}',
    };

    // Return the specified value whenever the spied get function is called
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: mock.nftCollections }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        ownerId: 'S2kR0sVzo7YIgIgshE-jQ',
      },
      headers: {
        Authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3VudHJ5Q29kZSI6IisxIiwibGFzdE5hbWUiOiJOYW1lIiwidXNlcklkIjoiMThrVDBpeWFRekM1SzRCZHV5ZThzIiwic3RhdHVzIjoiYWN0aXZlIiwiY3JlYXRlZCI6MTY0NjIzNjM1Njk4NSwiaXNQaG9uZVZlcmlmaWVkIjpmYWxzZSwicGhvbmUiOiIzMDcyMTUzNjU5IiwiZmlyc3ROYW1lIjoiVGVzdCIsImlzRW1haWxWZXJpZmllZCI6ZmFsc2UsIndhbGxldE5hbWUiOiJkYXZpdC5uZWFyIiwiaWF0IjoxNjQ3MjgwODQ3LCJleHAiOjE2NDczNjcyNDd9.GkcD3HCxQKm416dCeNVjlkjMAyQZNq6XNgRuUYAEujE',
      },
      body: '',
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.OK, item);

    const exp = JSON.parse(expectedResult.body).body;

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(exp).message);
  });

  it('should fail when collection list not found by owner', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: { ownerId: mock.ownerId },
      headers: { Authorization: mock.Authorization },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: "Collections doesn't exist.",
    });
    expect(result).toEqual(expectedResult);
  });

  it('should get nft-collection by owner id', async () => {
    // Return the specified value whenever the spied get function is called
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: mock.nftCollections }),
    });
    const event = {
      httpMethod: 'GET',
      pathParameters: { ownerId: mock.ownerId },
      headers: { Authorization: mock.Authorization },
    };
    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'NFT Collections retrieved successfully.',
      data: mock.nftCollections,
    });
    expect(result).toEqual(expectedResult);
  });

  it('should fail when ownerId is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {},
      headers: { Authorization: mock.Authorization },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "ownerId" is required.',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });
});
