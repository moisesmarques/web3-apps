const DynamoDB = require('aws-sdk/clients/dynamodb');

const { DYNAMODB_NEAR_NFTS_TABLE } = process.env;
// const options = IS_OFFLINE
//   ? {
//       region: "localhost",
//       endpoint: "http://localhost:8000",
//     }
//   : {};
const docClient = new DynamoDB.DocumentClient();

async function listNftByOwnerId(ownerWalletId) {
  const { Items } = await docClient
    .query({
      TableName: DYNAMODB_NEAR_NFTS_TABLE,
      IndexName: 'ownerWalletId-Index',
      KeyConditionExpression: 'ownerWalletId = :ownerWalletId ',
      FilterExpression: '#status <> :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':ownerWalletId': ownerWalletId,
        ':status': 'archived',
      },
    })
    .promise();
  return Items || [];
}

async function getNftById(nftId) {
  const params = {
    TableName: DYNAMODB_NEAR_NFTS_TABLE,
    Key: {
      nftId,
    },
  };
  const { Item } = await docClient.get(params).promise();
  return Item;
}

async function createNFT(data) {
  const Item = { ...data, created: +new Date(), updated: +new Date() };
  const params = {
    TableName: DYNAMODB_NEAR_NFTS_TABLE,
    Item,
  };
  await docClient.put(params).promise();
  return Item;
}

module.exports = {
  getNftById,
  listNftByOwnerId,
  createNFT,
};
