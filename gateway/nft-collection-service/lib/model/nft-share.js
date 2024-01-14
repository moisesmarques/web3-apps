const utils = require('../../utils');

const { DYNAMODB_NFT_SHARE_TABLE } = process.env;

async function getShareNftById(nftId) {
  const params = {
    TableName: DYNAMODB_NFT_SHARE_TABLE,
    IndexName: 'nftId-Index',
    KeyConditionExpression: '#nftId = :nftId',
    ExpressionAttributeValues: {
      ':nftId': nftId,
    },
    ExpressionAttributeNames: {
      '#nftId': 'nftId',
    },
  };
  const { Items } = await utils.dynamoDb.query(params);
  return Items;
}

module.exports = {
  getShareNftById,
};
