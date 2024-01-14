const DynamoDB = require('aws-sdk/clients/dynamodb');

const { DYNAMODB_NEAR_NFTS_SHARED_TABLE } = process.env;

const docClient = new DynamoDB.DocumentClient();

async function listSharedNftByRecipientWalletId(recipientWalletId) {
  const { Items } = await docClient
    .query({
      TableName: DYNAMODB_NEAR_NFTS_SHARED_TABLE,
      IndexName: 'recipientWalletId-Index',
      KeyConditionExpression: 'recipientWalletId = :recipientWalletId ',
      ExpressionAttributeValues: {
        ':recipientWalletId': recipientWalletId,
      },
    })
    .promise();
  return Items || [];
}

async function listSharedNftByOwnerWalletId(ownerWalletId) {
  const { Items } = await docClient
    .query({
      TableName: DYNAMODB_NEAR_NFTS_SHARED_TABLE,
      IndexName: 'ownerWalletId-Index',
      KeyConditionExpression: 'ownerWalletId = :ownerWalletId ',
      ExpressionAttributeValues: {
        ':ownerWalletId': ownerWalletId,
      },
    })
    .promise();
  return Items || [];
}

async function createShareNFT(data) {
  const Item = { ...data, created: +new Date(), updated: +new Date() };
  const params = {
    TableName: DYNAMODB_NEAR_NFTS_SHARED_TABLE,
    Item,
  };
  await docClient.put(params).promise();
  return Item;
}
async function deleteShareNFT(shareId) {
  // const Item = { ...data, created: +new Date(), updated: +new Date() };
  const params = {
    TableName: DYNAMODB_NEAR_NFTS_SHARED_TABLE,
    Key: { shareId },
  };
  await docClient.delete(params).promise();
}
async function getSharedNft(nftId, walletId, recipientWalletId) {
  const params = {
    TableName: process.env.DYNAMODB_NEAR_NFTS_SHARED_TABLE,
    IndexName: 'nftId-Index',
    KeyConditionExpression: 'nftId = :nftId',
    FilterExpression:
      'ownerWalletId = :walletId and recipientWalletId = :recipientWalletId',
    ExpressionAttributeValues: {
      ':nftId': nftId,
      ':walletId': walletId,
      ':recipientWalletId': recipientWalletId,
    },
  };
  const { Items } = await docClient.query(params).promise();
  return Items && Items.length > 0 ? Items[0] : undefined;
}

module.exports = {
  listSharedNftByRecipientWalletId,
  listSharedNftByOwnerWalletId,
  createShareNFT,
  deleteShareNFT,
  getSharedNft,
};
