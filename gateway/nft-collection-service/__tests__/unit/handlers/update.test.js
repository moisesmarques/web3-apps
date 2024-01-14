/* eslint-disable no-undef */

const dynamodb = require('aws-sdk/clients/dynamodb');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const sinon = require('sinon');
const lambda = require('../../../update');
const utils = require('../../../utils');
const mock = require('./mock.json');

describe('Update Collection by collectionId', () => {
  let getSpy;

  beforeAll(() => {
    // It is just the way to bypass the DynamoDB oprations during Test Case
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');

    // It is just the way to bypass the JWT oprations during Test Case
    sinon.stub(jwt, 'verify').callsFake(() => mock.user);

    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
  });

  // Clean up mocks
  afterAll(() => {
    sinon.restore();
    getSpy.mockRestore();
    updateSpy.mockRestore();
  });

  it('should fail when nftCollectionId is missing', async () => {
    const event = {
      httpMethod: 'PUT',
      pathParameters: {},
      headers: { Authorization: mock.Authorization },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "nftCollectionId" is required.',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when auth is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: { nftCollectionId: mock.collectionId },
      headers: {},
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.UNAUTHORIZED, {
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

  it('it should fail to update collection due to schema validation', async () => {
    const event = {
      httpMethod: 'PATCH',
      pathParameters: { nftCollectionId: mock.collectionId },
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        collectionName: 'My Second Collection',
        ownerId: '@@',
      }),
    };

    const result = await lambda.handler(event);
    const body = JSON.parse(result.body);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid.',
      errors: body.errors,
    });

    expect(result).toEqual(expectedResult);
  });

  it('it should update collection', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }),
    });
    const event = {
      httpMethod: 'PATCH',
      pathParameters: { nftCollectionId: mock.collectionId },
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        collectionName: mock.collectionName,
        ownerId: mock.ownerId,
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'NFT collection updated successfully.',
    });

    expect(result).toEqual(expectedResult);
  });
});
