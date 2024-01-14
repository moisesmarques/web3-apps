const DynamoDB = require('aws-sdk/clients/dynamodb');

const docClient = new DynamoDB.DocumentClient();

const deleteApp = async (appId) => {
  const tableParams = {
    TableName: process.env.TABLE_NEAR_APPS,
    Key: {
      appId,
    },
    UpdateExpression: 'set #appStatus = :status',
    ExpressionAttributeNames: {
      '#appStatus': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'archived',
    },
  };
  const { Item } = await docClient.update(tableParams).promise();
  return Item;
};

const getApp = async (appId) => {
  const tableParams = {
    TableName: process.env.TABLE_NEAR_APPS,
    Key: {
      appId,
    },
  };
  const { Item } = await docClient.get(tableParams).promise();
  return Item;
};

module.exports = {
  deleteApp, getApp,
};
