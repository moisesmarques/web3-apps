const dynamodb = require('aws-sdk/clients/dynamodb');
const { StatusCodes } = require('http-status-codes');

const nearAPI = require('near-api-js');
const buildUpdateExpression = require('../../../build-update-expression');
const utils = require('../../../utils');
const analytics_lambda = require('../../../process-analytics');
const fee_analytics = require('../../../process-get-fee-analytics');
const proc_trx = require('../../../process-transaction');

const mockConnect = jest.fn();
const mockAccount = jest.fn();
nearAPI.connect = mockConnect;

describe('Main method', () => {
  let querySpy; let updateSpy; let putSpy; let
    nearSpy;

  beforeAll(() => {
    querySpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'query');
    updateSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'update');
    putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    console.log(nearAPI);
    mockConnect.mockReturnValue({
      promise: () => Promise.resolve({}),
    });
  });

  afterAll(() => {
    querySpy.mockRestore();
    updateSpy.mockRestore();
    putSpy.mockRestore();
    mockConnect.mockRestore();
  });

  jest.setTimeout(5000);

  it('buildUpdateExpression success case', async () => {
    const result = buildUpdateExpression.buildUpdateExpression({});

    expect(result).toBeDefined();
  });

  it('buildUpdateExpression success case1', async () => {
    const result = buildUpdateExpression.buildUpdateExpression({ status: 'success' });

    expect(result).toBeDefined();
  });

  it('buildUpdateExpression success case2', async () => {
    const result = buildUpdateExpression.buildUpdateExpression({ alpha: 'success' });

    expect(result).toBeDefined();
  });

  it('process-analytics error case', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: { privateKey: '' } }),
    });
    const event = {
      Records: [
        {
          body: JSON.stringify({ senderWalletId: 'eshwar.near', operation: 'post', senderPrivateKey: '' }),
        },
      ],
    };

    const result = await analytics_lambda.handler(event);
    console.log(result);
    expect(result).toBe(undefined);
  });

  // it('process-analytics success case', async () => {
  //     querySpy.mockReturnValue({
  //         promise: () => Promise.resolve({ Items: [{ privateKey: '3by8kdJoJHu7uUkKfoaLJ2Dp1q1TigeWMGpHu9UGXsWdREqPcshCM223kWadmrMKpV9AsWG5wL9F9hZzjHSRFXud' }], Count: 1 }),
  //     });

  //     const event = {
  //         Records: [
  //             {
  //                 body: JSON.stringify({ senderWalletId: 'eshwar.near', operation: 'post', senderPrivateKey: 'alpharomeocharlie' })
  //             }
  //         ]
  //     }

  //     const result = await lambda.handler(event);
  //     expect(result).toBe(undefined);

  // });

  it('process-get-fee-analytics failure case', async () => {
    putSpy.mockReturnValue({
      promise: () => Promise.reject({ Item: {} }),
    });
    const event = {
      Records: [
        {
          body: JSON.stringify({ senderWalletId: 'eshwar.near', operation: 'post', senderPrivateKey: 'alpharomeocharlie' }),
        },
      ],
    };

    const result = await fee_analytics.handler(event);
    expect(result).toBe(undefined);
  });

  it('process-get-fee-analytics success case', async () => {
    putSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: {} }),
    });
    const event = {
      Records: [
        {
          body: JSON.stringify({ senderWalletId: 'eshwar.near', operation: 'post', senderPrivateKey: 'alpharomeocharlie' }),
        },
      ],
    };

    const request = await fee_analytics.handler(event);
    console.log(request);
  });

  it('process-transaction failure case1', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: {} }),
    });
    const event = {
      Records: [
        {
          body: JSON.stringify({ type: 'create_account' }),
        },
      ],
    };

    const result = await proc_trx.handler(event);
    expect(result).toBe(undefined);
  });

  it('process-transaction failure case2', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.reject({ Item: undefined }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.reject({ Item: {} }),
    });
    const event = {
      Records: [
        {
          body: JSON.stringify({ type: 'nft_series_create', senderWalletId: 'eshwar.near' }),
        },
      ],
    };

    const result = await proc_trx.handler(event);
    expect(result).toBe(undefined);
  });

  it('process-transaction failure case3', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: undefined }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.reject({ Item: {} }),
    });
    const event = {
      Records: [
        {
          body: JSON.stringify({ type: 'nft_series_create', senderWalletId: 'eshwar.near' }),
        },
      ],
    };

    const result = await proc_trx.handler(event);
    expect(result).toBe(undefined);
  });

  it('process-transaction failure case4', async () => {
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: {} }),
    });
    const event = {
      Records: [
        {
          body: JSON.stringify({ type: 'nft_series_create', senderWalletId: 'eshwar.near' }),
        },
      ],
    };

    const result = await proc_trx.handler(event);
    expect(result).toBe(undefined);
  });

  it('process-transaction failure case5', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [{ requestParams: {} }], Count: 1 }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: {} }),
    });
    const event = {
      Records: [
        {
          body: JSON.stringify({ type: 'nft_series_create', senderWalletId: 'eshwar.near', transactionId: '1234' }),
        },
      ],
    };

    const result = await proc_trx.handler(event);
    expect(result).toBe(undefined);
  });

  it('process-transaction failure case6', async () => {
    querySpy.mockReturnValue({
      promise: () => Promise.resolve({ Items: [{ requestParams: JSON.stringify({ key1: 'key1' }), type: 'nft_series_mint' }], Count: 1 }),
    });
    updateSpy.mockReturnValue({
      promise: () => Promise.resolve({ Item: {} }),
    });
    const event = {
      Records: [
        {
          body: JSON.stringify({ type: 'nft_series_create', senderWalletId: 'eshwar.near', transactionId: '1234' }),
        },
      ],
    };

    const result = await proc_trx.handler(event);
    expect(result).toBe(undefined);
  });
});
