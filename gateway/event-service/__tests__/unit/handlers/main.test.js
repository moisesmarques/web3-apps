const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const buildUpdateExpression = require('../../../build-update-expression');
const utils = require('../../../utils');
const lambda = require('../../../process-sqs-events');

describe('Main method', () => {
  let querySpy; let
    updateSpy;

  beforeAll(() => {
    querySpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
  });

  afterAll(() => {
    querySpy.mockRestore();
    updateSpy.mockRestore();
  });

  jest.setTimeout(5000);

  it('buildUpdateExpression success case', async () => {
    const result = buildUpdateExpression.buildUpdateExpression({
      'status': 'pass'
    });

    expect(result).toBeDefined();
  });

  it('processBlockchainResults success case', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({
        Count: 1,
        Items: [
          {
            transactionId: 1,
            args: 1,
          },
        ],
      }),
    });

    updateSpy.mockReturnValue({
      promise: () => Promise.resolve(null),
    });

    const blockchainResult = {
      id: 1,
      Receipt: 'abcdefghijklmnopq',
    };

    const result = await utils.processBlockchainResults(blockchainResult);

    expect(result).toBeDefined();
  });

  it('updateTransaction success case', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve(null),
    });

    const result = await utils.updateTransaction(1, {});

    expect(result).toBeDefined();
  });

  it('getTransactionByJobId success case', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({
        Count: 1,
        Items: [
          {
            transactionId: 1,
            args: 1,
          },
        ],
      }),
    });

    const result = await utils.getTransactionByJobId(1);

    expect(result).toBeDefined();
  });

  it.skip('publish success case', async () => {
    const result = await utils.publish(null, null);

    expect(result).toBeFalsy();
  });

  it('extractHash success case', async () => {
    const blockchainResult = {
      explorerUrl: 'abcdefghijklmnopq',
    };

    const result = await utils.extractHash(blockchainResult);

    expect(result).toBeDefined();
  });

  it('publishLogFileMessage success case', async () => {
    const result = await utils.publishLogFileMessage(null);

    expect(result).toBeFalsy();
  });

  it('publishAnalyticsV2Message success case', async () => {
    const result = await utils.publishAnalyticsV2Message(null);

    expect(result).toBeFalsy();
  });

  it('publishAnalyticsMessage success case', async () => {
    const result = await utils.publishAnalyticsMessage(null);

    expect(result).toBeFalsy();
  });

  it('publishPostTransactionMessage success case', async () => {
    const result = await utils.publishPostTransactionMessage(null);

    expect(result).toBeFalsy();
  });

  it('publishPostTransactionMessage success case', async () => {
    const result = await utils.publishPostTransactionMessage(null);

    expect(result).toBeFalsy();
  });

  it('main success case1', async () => {
    const event = {
      Records: [
        {
          body: '{ }',
        },
      ],
    };

    const result = await lambda.main(event);

    expect(result).toEqual(true);
  });

  it('main success case1', async () => {
    const event = {
      Records: [
        {
          alpha: '{ }',
        },
      ],
    };

    const result = await lambda.main(event);

    expect(result).toEqual(true);
  });
});
