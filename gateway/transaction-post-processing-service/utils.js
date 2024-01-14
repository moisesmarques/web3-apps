const AWS = require('aws-sdk');

const getPrivateKey = async (walletId) => {
  const wallet = await getWalletPrivate(walletId);

  if (!wallet) {
    console.log('Wallet not found.', walletId);
    return '';
  }
  return wallet.privateKey;
};

const getWalletPrivate = async (walletId) => {
  const docClient = new AWS.DynamoDB.DocumentClient();

  const tableParams = {
    KeyConditionExpression: 'walletId = :walletId ',
    ExpressionAttributeValues: { ':walletId': walletId },
    TableName: 'near-wallets-private',
  };

  const result = await docClient.query(tableParams).promise();

  return result.Count ? result.Items[0] : null;
};

module.exports = {
  getPrivateKey,
};
