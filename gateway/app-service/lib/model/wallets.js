const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const { DYNAMODB_WALLET_TABLE } = process.env;

async function getUserByWallet(walletName) {
  const params = {
    TableName: DYNAMODB_WALLET_TABLE,
    IndexName: 'walletName-Index',
    KeyConditionExpression: 'walletName = :walletName',
    ExpressionAttributeValues: {
      ':walletName': walletName,
    },
  };

  const { Items } = await dynamoDb.query(params).promise();
  return Items[0];
}

module.exports = {
  getUserByWallet,
};
