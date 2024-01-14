const AWS = require('aws-sdk');
const { nanoid } = require('nanoid');
const { publishSqs } = require('./publish-sqs');

const docClient = new AWS.DynamoDB.DocumentClient();
const {
  STAGE,
  CONTRACTS_SERVICE_POST_SQS_MAINNET,
  CONTRACTS_SERVICE_POST_SQS_TESTNET,
  CONTRACT_SEND_MAINNET,
  CONTRACT_SEND_TESTNET,
  CONTRACT_USERID_MAINNET,
  CONTRACT_USERID_TESTNET,
} = process.env;
const CONTRACTS_SERVICE_POST_SQS = STAGE === 'dev' ? CONTRACTS_SERVICE_POST_SQS_MAINNET : CONTRACTS_SERVICE_POST_SQS_TESTNET;
const CONTRACT_SEND = STAGE === 'dev' ? CONTRACT_SEND_MAINNET : CONTRACT_SEND_TESTNET;
const CONTRACT_USERID = STAGE === 'dev' ? CONTRACT_USERID_MAINNET : CONTRACT_USERID_TESTNET;

exports.handler = async (event) => {
  await Promise.all(event.Records.map(async (event) => {
    console.log(event);
    const { body } = event;
    const parsedBody = body ? JSON.parse(body) : {};

    try {
      const transaction = await createTransaction(parsedBody, 'insert_analytics');

      const getTransactionFeeMessage = createGetTransactionFeeMessage(transaction.jobId, transaction.senderWalletId, transaction.appId, transaction.actionId);

      await publishSqs(getTransactionFeeMessage, CONTRACTS_SERVICE_POST_SQS, 'contract_service');
    } catch (err) {
      console.log('Get Trasaction Fee processing failed!', err);
    }
  }));
};

const generateJobId = (id) => id.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

const createTransaction = async (params, type = null) => {
  const transactionId = nanoid();
  const jobId = generateJobId(transactionId);

  const tableParams = {
    TableName: 'near-transactions',
    Item: {
      transactionId,
      senderWalletId: params.senderWalletId,
      receiverWalletId: params.receiverWalletId,
      transactionValue: params.transactionValue,
      transactionItemId: params.transactionItemId,
      type,
      operation: params.type,
      tags: params.tags,
      jobId,
      status: params.status ? params.status : 'complete',
      contractData: params.contractData,
      blockchainStatus: 'pending',
      parentId: params.parentId,
      transactionUrl: params.transactionUrl,
      appId: params.appId,
      actionId: params.actionId,
      created: +new Date(),
      updated: +new Date(),
      requestParams: JSON.stringify(params),
    },
  };
  console.log(tableParams);
  await docClient.put(tableParams).promise();
  return tableParams.Item;
};

const createGetTransactionFeeMessage = (jobId, senderWalletId, appId, actionId) => ({
  id: jobId,
  operation: 'execute',
  contract: CONTRACT_SEND, // "send-near.nearapps.near",
  method: 'send_logged',
  deposit: '0.00072',
  args: {
    receiver: senderWalletId,
    amount: '700000000000000000000', // "0.0007" Near
    nearapps_tags: {
      app_id: appId,
      action_id: actionId,
      user_id: CONTRACT_USERID, // "v2.nearapps.near"
    },
  },
  tags: {
    app_id: appId,
    action_id: actionId,
    user_id: CONTRACT_USERID, // "v2.nearapps.near"
  },
});
