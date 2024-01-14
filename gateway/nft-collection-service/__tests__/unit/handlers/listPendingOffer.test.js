const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../list-offers');
const utils = require('../../../utils');
const mock = require('./mock.json');

describe('Get pending offer by nftId', () => {
  let getSpy;

  beforeAll(() => {
    getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
  });

  // Clean up mocks
  afterAll(() => {
    getSpy.mockRestore();
  });

  it('should fail when validation is missing', async () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        status: '',
        nftId: mock.offers[0].nftId,
      },
      headers: { Authorization: mock.Authorization },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid.',
    });

    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });

  it('should get list pending offer by status and nftId', async () => {
    getSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: mock.offers }),
    });

    const event = {
      httpMethod: 'GET',
      pathParameters: {
        nftId: mock.offers[0].nftId,
        status: mock.offers[0].status,
      },
      headers: { Authorization: mock.Authorization },
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.OK, {
      message: `offer list by '${mock.offers[0].status}' retrieved successfully`,
      data: mock.offers,
    });
    expect(JSON.parse(result.body).message).toEqual(JSON.parse(expectedResult.body).message);
  });
});
