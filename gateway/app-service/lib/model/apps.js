const AWS = require('aws-sdk');

const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

async function contactItemOutput(contactId) {
  const params = {
    TableName: 'near-contacts',
    Key: {
      contactId,
    },
  };

  const { Item } = await dynamoDbClient.get(params).promise();
  return Item;
}

async function appItemOutput(appId) {
  const params = {
    TableName: 'near-apps',
    Key: {
      appId,
    },
  };
  const { Item } = await dynamoDbClient.get(params).promise();
  return Item;
}

module.exports = {
  contactItemOutput,
  appItemOutput,
};
