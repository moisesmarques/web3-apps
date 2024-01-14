const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const lambda = require('../../../handle-offer');
const utils = require('../../../utils');
const mock = require('./mock.json');

describe('Update Collection by collectionId', () => {
  let getSpy;

  beforeAll(() => {
    // It is just the way to bypass the DynamoDB oprations during Test Case
    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
  });

  // Clean up mocks
  afterAll(() => {
    updateSpy.mockRestore();
  });

  it('should fail when offerId is missing', async () => {
    const event = {
      httpMethod: 'PATCH',
      pathParameters: {},
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        action: 'approved',
        note: 'some-note',
      }),
    };

    const result = await lambda.handler(event);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "offerId" is required.',
    });

    expect(JSON.parse(result.body).message).toEqual(
      JSON.parse(expectedResult.body).message,
    );
  });

  it('should fail to update offer due to schema validation', async () => {
    const event = {
      httpMethod: 'PATCH',
      pathParameters: { offerId: mock.offers[0].offerId },
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        action: '@@',
        note: 'some-note',
      }),
    };

    const result = await lambda.handler(event);
    const body = JSON.parse(result.body);

    const expectedResult = utils.send(StatusCodes.BAD_REQUEST, {
      message: 'One or more fields are invalid.',
      errors: body.errors,
    });

    expect(result.body.body).toEqual(expectedResult.message);
  });

  it('should update offer', async () => {
    const event = {
      httpMethod: 'PATCH',
      pathParameters: { offerId: mock.offers[0].offerId },
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        action: 'approved',
        note: 'some-note',
      }),
    };

    updateSpy.mockReturnValueOnce({
      promise: () => Promise.resolve({ Attributes: { ...mock.offers[0], status: 'approved', note: 'some-note' } }),
    });

    const result = await lambda.handler(event);
    const body = JSON.parse(result.body);

    const expectedResult = utils.send(StatusCodes.OK, {
      data: { ...mock.offers[0], status: 'approved', note: 'some-note' },
    });

    expect(JSON.parse(result.body).data).toEqual(JSON.parse(expectedResult.body).data);
  });

  it('should fail when InternalServerError', async () => {
    const event = {
      httpMethod: 'PATCH',
      pathParameters: { offerId: mock.offers[0].offerId },
      headers: { Authorization: mock.Authorization },
      body: JSON.stringify({
        action: 'approved',
        note: 'some-note',
      }),
    };

    updateSpy.mockReturnValueOnce({
      promise: () => Promise.reject({ Attributes: { ...mock.offers[0], status: 'approved', note: 'some-note' } }),
    });

    const result = await lambda.handler(event);
    const body = JSON.parse(result.body);

    const expectedResult = utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {});

    expect(JSON.parse(result.body).data).toEqual(JSON.parse(expectedResult.body).data);
  });
});
