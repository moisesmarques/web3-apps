const { nanoid } = require('nanoid');
const axios = require('axios');

const reqId = nanoid();
const DynamoDB = require('aws-sdk/clients/dynamodb');

const client = new DynamoDB.DocumentClient();

const dynamoDb = {
  get: (params) => client.get(params).promise(),
  scan: async (params) => {
    const resultArr = [];
    await client.scan(params, onScan).promise();
    return resultArr;

    function onScan(err, data) {
      if (err) {
        console.error(
          'Unable to scan the table. Error JSON:',
          JSON.stringify(err, null, 2),
        );
      } else {
        data.Items.forEach((itemdata) => {
          resultArr.push(itemdata);
        });
        // continue scanning if we have more items
        if (typeof data.LastEvaluatedKey !== 'undefined') {
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          client.scan(params, onScan);
        }
      }
    }
  },
  batchGet: (params) => client.batchGet(params).promise(),
  batchWrite: (params) => client.batchWrite(params).promise(),
  query: (params) => client.query(params).promise(),
  put: (params) => client.put(params).promise(),
  update: (params) => client.update(params).promise(),
  delete: (params) => client.delete(params).promise(),
  transactWriteItems: (params) => client.transactWrite(params).promise(),
};

const send = (statusCode, data, err = null) => {
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };

  if (err) {
    if (err.name === 'TokenExpiredError') {
      const { message } = err;
      return {
        statusCode: 401,
        headers: responseHeaders,
        body: JSON.stringify({
          message,
        }),
      };
    }
  }

  return {
    statusCode,
    headers: responseHeaders,
    body: JSON.stringify(data),
  };
};

const checkWalletNameExists = async (walletName) => {
  const params = {
    TableName: process.env.DYNAMODB_WALLET_TABLE,
    IndexName: 'walletName-Index',
    KeyConditionExpression: 'walletName = :walletName',
    ExpressionAttributeValues: {
      ':walletName': walletName,
    },
  };
  const result = await dynamoDb.query(params);
  const dbWalletCheck = result.Count > 0;

  let indexerCheck = false;
  try {
    const config = {
      headers: {
        jwt_token: `${process.env.INDEXER_STATIC_JWT_TOKEN}`,
      },
    };
    const indexerWalletCheckURL = `${process.env.INDEXER_API_URL}/wallets/${walletName}`;
    console.log(
      `reqId: ${reqId}, indexerWalletCheckURL`,
      indexerWalletCheckURL,
    );
    const indexerWalletCheckResponse = await axios.get(
      indexerWalletCheckURL,
      config,
    );
    console.log(
      `reqId: ${reqId}, indexerWalletCheckResponse `,
      indexerWalletCheckResponse,
    );
  } catch (err) {
    console.log(
      `Silent fail indexer check wallet name: ${walletName}`,
      err.response.status,
    );
    console.log(
      `Silent fail indexer check wallet name: ${walletName}`,
      err.response.message,
    );
    indexerCheck = err.response.status != 400;
  }

  console.log('dbWalletCheck - ', dbWalletCheck);
  console.log('indexerCheck - ', indexerCheck);

  // TODO: this is a hotfix made by @adnene we need to figure out why we are getting 409 in
  //  production only when we create a user
  // return dbWalletCheck || indexerCheck;
  return dbWalletCheck;
};

module.exports = {
  send,
  checkWalletNameExists,
};
