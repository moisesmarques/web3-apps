const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../get');
const utils = require('../../../utils');
const mock = require('./mock.json');

describe('Get collection by id', () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
  });

  // Clean up mocks
  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should fail when validation is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftCollectionId: '',
      },
      headers: { Authorization: mock.Authorization },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter \"nftCollectionId\" is required.',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should get nft-collection by collection id', async () => {
    // Return the specified value whenever the spied get function is called
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mock.nftCollections[0] }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: { nftCollectionId: mock.nftCollections[0].collectionId },
      headers: { Authorization: mock.Authorization },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'NFT collection retrieved successfully.',
      data: mock.nftCollections[0],
    });
    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should fail when InternalServerError', async () => {
    // Return the specified value whenever the spied get function is called
    getSpy.mockReturnValue({
      promise: () => Promise.reject({ Item: mock.nftCollections[0] }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: { nftCollectionId: mock.nftCollections[0].collectionId },
      headers: { Authorization: mock.Authorization },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'NFT collection retrieved successfully.',
      data: mock.nftCollections[0],
    });
    expect(result.statusCode).toEqual(expectedResult.statusCode);
  });

  it('should get nft-collection by collection id with inactive collection', async () => {
    // Return the specified value whenever the spied get function is called
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mock.nftCollections[1] }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: { nftCollectionId: mock.nftCollections[1].collectionId },
      headers: { Authorization: mock.Authorization },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'Collection not found for collectionID: '+mock.nftCollections[1].collectionId
    });
    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });
});
