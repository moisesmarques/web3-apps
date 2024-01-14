const AWS = require('aws-sdk');
const _ = require('underscore');
const { buildUpdateExpression } = require('./build-update-expression');

AWS.config.update({ region: 'us-east-1' });

const updateTransaction = async (transactionId, data) => {
  console.log('updateTransaction ---> ', transactionId, data);

  const docClient = new AWS.DynamoDB.DocumentClient();
  const tableParams = {
    TableName: 'near-transactions',
    Key: {
      transactionId,
    },
    ...buildUpdateExpression(data),
  };

  console.log('updateTransaction tableParams ---> ', JSON.stringify(tableParams));

  return docClient.update(tableParams).promise();
};

const getTransactionByJobId = async (jobId) => {
  console.log('getTransactionByJobId ---> ', jobId);

  const docClient = new AWS.DynamoDB.DocumentClient();

  const tableParams = {
    KeyConditionExpression: 'jobId = :jobId ',
    ExpressionAttributeValues: { ':jobId': jobId },
    TableName: 'near-transactions',
    IndexName: 'jobId-created-Index',
  };

  const result = await docClient.query(tableParams).promise();
  return result.Count ? result.Items[0] : null;
};

const extractHash = (blockchainResult) => {
  const hashArr = blockchainResult.explorerUrl ? blockchainResult.explorerUrl.split('/') : [];

  return hashArr && hashArr.length ? hashArr[hashArr.length - 1] : '';
};

const processBlockchainResults = async (blockchainResult) => {
  console.log('processBlockchainResults -> ', blockchainResult);

  const hashValue = blockchainResult.Receipt ? blockchainResult.Receipt : extractHash(blockchainResult);

  const transactionObj = await getTransactionByJobId(blockchainResult.id);

  console.log('transactionObj -> ', transactionObj);

  if (!transactionObj) {
    console.log('Transaction object from DB for the job id seems to be empty!', transactionObj);
    return;
  }

  const updateObject = {
    transactionHash: hashValue,
    contractOutArgs: blockchainResult.args,
    blockchainStatus: 'complete',
    updated: +new Date(),
  };

  await updateTransaction(transactionObj.transactionId, updateObject);

  const transactionUpdated = { ...transactionObj, ...updateObject };

  if (transactionObj.type === 'create_account') {
    await publishAnalyticsMessage(transactionUpdated);
    await publishPostTransactionMessage(transactionUpdated);
  } else if (transactionObj.type === 'nft_series_create') {
    await publishAnalyticsMessage(transactionUpdated);
    await publishPostTransactionMessage(transactionUpdated);
  } else if (transactionObj.type === 'nft_series_mint') {
    await publishAnalyticsMessage(transactionUpdated);
  } else if (transactionObj.type === 'transfer_nft') {
    await publishAnalyticsMessage(transactionUpdated);
  } else if (transactionObj.type === 'insert_analytics') {
    await publishAnalyticsV2Message(transactionUpdated);
  } else if (transactionObj.type === 'log_file') {
    await publishLogFileMessage(transactionUpdated);
    await publishAnalyticsMessage(transactionUpdated);
  }

  return transactionUpdated;
};

const publishLogFileMessage = async (data) => {
  await publish(data, process.env.LOGFILE_SQS_URL);
};

const publishAnalyticsV2Message = async (data) => {
  await publish(data, process.env.ANALYTICS_V2_SQS_URL);
};

const publishAnalyticsMessage = async (data) => {
  await publish(data, process.env.ANALYTICS_SQS_URL);
};

const publishPostTransactionMessage = async (data) => {
  await publish(data, process.env.POST_TRANSACTION_SQS_URL);
};

const publish = async (data, queueUrl) => {
  try {
    console.log('Publishing on SQS:', queueUrl, data);

    const sqs = new AWS.SQS({ region: process.env.REGION });

    const response = await sqs.sendMessage({
      MessageBody: JSON.stringify(data),
      QueueUrl: queueUrl,
    }).promise();

    console.log('Message published on SQS:', queueUrl, response);
  } catch (err) {
    console.log('Error when publishing on SQS:', queueUrl, err);
  }
};

module.exports = {
  processBlockchainResults,
  updateTransaction,
  getTransactionByJobId,
  publish,
  extractHash,
  publishLogFileMessage,
  publishAnalyticsV2Message,
  publishAnalyticsMessage,
  publishPostTransactionMessage,
};
