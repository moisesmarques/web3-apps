const { DocumentClient } = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');
const requestAccessUtils = require('../../../lib/model/requestAccess');

const lambda = require('../../../requestAccess');
const utils = require('../../../utils');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const data = require('./mock/request');

describe('Test create', () => {
  let putSpy, querySpy, getSpy;
  let checkIfRequestExistsSpy;

  beforeAll(() => {
    checkIfRequestExistsSpy = jest.spyOn(
      requestAccessUtils,
      'checkIfRequestExists'
    );
    putSpy = jest.spyOn(DocumentClient.prototype, 'put');
    getSpy = jest.spyOn(DocumentClient.prototype, 'get');
    querySpy = jest.spyOn(DocumentClient.prototype, 'query');
    sinon.stub(jwt, 'verify').callsFake(() => data.jwtMock);
  });

  // Clean up mocks
  afterAll(() => {
    putSpy.mockRestore();
    getSpy.mockRestore();
    querySpy.mockRestore();
    checkIfRequestExistsSpy.mockRestore();
  });

  it('should fail when nft is not found', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });

    const result = await lambda.handler(data.eventPayload);

    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: "NFT with id 'my-id' not found",
    });

    expect(JSON.parse(result.body).message).toEqual(
      JSON.parse(expectedResult.body).message
    );
  });

  it('should fail when nftId is missing', async () => {
    const eventPayload = {
      httpMethod: 'POST',
      pathParameters: { nftId1: undefined },
      headers: {
        Authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsYXN0TmFtZSI6Iktpdml0ZSIsInVzZXJJZCI6Il9CRV9PdTVleFhxVy13Rkx1VHh1ZCIsInN0YXR1cyI6ImFjdGl2ZSIsImNyZWF0ZWQiOjE2NDYyMDkzMTg3MTAsImlzUGhvbmVWZXJpZmllZCI6ZmFsc2UsImVtYWlsIjoidGtpdml0ZUBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJUaXR1cyIsImlzRW1haWxWZXJpZmllZCI6ZmFsc2UsIndhbGxldE5hbWUiOiJ0aXR1c1dhbGxldC5uZWFyIiwiaWF0IjoxNjQ2MzI3MTMzLCJleHAiOjE2NDY0MTM1MzN9.PFA57GwzBuIM8O04XICee1xFTciApptbDCGTjTWPtyU',
      },
    };

    const result = await lambda.handler(eventPayload);
    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Missing nftId path param',
    });

    expect(result).toEqual(expectedResult);
  });

  it('should fail when pending access request for the same user & nft exists', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: {} }),
    });

    checkIfRequestExistsSpy.mockReturnValue({
      promise: () => Promise.resolve(true),
    });

    querySpy.mockReturnValue({
      promise: () => Promise.resolve(false),
    });
    putSpy.mockReturnValue({
      promise: () =>
        Promise.reject({
          message: 'You have already requested access to this NFT',
        }),
    });

    const result = await lambda.handler(data.eventPayload);

    const expectedResult = utils.send(StatusCodes.CONFLICT, {
      message: 'You have already requested access to this NFT',
    });

    expect(JSON.parse(result.body).message).toEqual(
      JSON.parse(expectedResult.body).message
    );
  });

  it('should succeed sharing NFT', async () => {
    getSpy.mockImplementation((params) => ({
      promise: () =>
        Promise.resolve({
          Item: params?.IndexName === 'nftId-Index' ? undefined : {},
        }),
    }));

    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: {} }),
    });

    checkIfRequestExistsSpy.mockReturnValue({
      promise: () => Promise.resolve(false),
    });

    const result = await lambda.handler(data.eventPayload);

    const expectedResult = utils.send(StatusCodes.CREATED, {
      message: 'Access request created successfully.',
    });

    expect(JSON.parse(result.body).message).toEqual(
      JSON.parse(expectedResult.body).message
    );
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should succeed sharing NFT1', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.myNft }),
    });
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: data.myNft }),
    });
    const result = await lambda.handler(data.eventPayload);
    const expectedResult = utils.send(StatusCodes.CONFLICT, {
      message: 'You have already requested access to this NFT',
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });
});
