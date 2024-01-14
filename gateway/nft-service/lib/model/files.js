const DynamoDB = require('aws-sdk/clients/dynamodb');

const docClient = new DynamoDB.DocumentClient();

const { TABLE_NAME_FILES = 'near-files' } = process.env;

async function getFileById(walletId, fileId) {
  const { Item } = await docClient
    .get({
      TableName: TABLE_NAME_FILES,
      Key: {
        fileId,
        walletId,
      },
    })
    .promise();
  return Item;
}

module.exports = {
  getFileById,
};
