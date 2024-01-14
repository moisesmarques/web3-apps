const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../get');
const utils = require('../../../utils');
const mock = require('./mock.json');

describe('Get pending offer by nftId', () => {
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
      },
      headers: { Authorization: mock.Authorization },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.NOT_FOUND, {
      message: 'The path parameter \"nftCollectionId\" is required.',
    });
    expect(result).toEqual(expectedResult);
  });

  it('should get list pending offer by nftId', async () => {
    // Return the specified value whenever the spied get function is called
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mock.nftCollections[0] }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftCollectionId: mock.collectionId,
      },
      headers: { Authorization: mock.Authorization },
    };

    const result = await lambda.handler(event);
    const expectedResult = utils.send(StatusCodes.OK, {
      message: 'NFT collection retrieved successfully.',
      data: mock.nftCollections[0],
    });
    expect(result).toEqual(expectedResult);
  });
});
