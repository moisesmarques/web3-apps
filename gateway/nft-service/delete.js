const { StatusCodes } = require('http-status-codes');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const utils = require('./utils');

const docClient = new DynamoDB.DocumentClient();

const getNftById = async (nftId) => {
  const tableParams = {
    TableName: process.env.DYNAMODB_NEAR_NFTS_TABLE,
    Key: {
      nftId,
    },
  };
  const result = await docClient.get(tableParams).promise();
  return result.Item;
};
const deleteNFT = async (nftId, ownerWalletId) => {
  const tableParams = {
    TableName: process.env.DYNAMODB_NEAR_NFTS_TABLE,
    Key: {
      nftId,
    },
    UpdateExpression: 'set #nftStatus = :status',
    ConditionExpression: '#ownerWalletId = :ownerWalletId and #nftId = :nftId ',
    ExpressionAttributeNames: {
      '#nftId': 'nftId',
      '#ownerWalletId': 'ownerWalletId',
      '#nftStatus': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'archived',
      ':nftId': nftId,
      ':ownerWalletId': ownerWalletId,
    },
  };
  const { Item } = await docClient.update(tableParams).promise();
  return Item;
};

module.exports.handler = async (event) => {
  // delete updates status to archived
  try {
    const { nftId } = event.pathParameters;

    if (!nftId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Missing nftId path param',
        data: {},
      });
    }

    // const userInfo = await utils.verifyAccessToken(event);
    const userInfo = await utils.verifyAccessToken(event);
    const nft = await getNftById(nftId);

    if (!nft) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: 'NFT does not exist.',
        data: {},
      });
    }

    const { ownerWalletId } = nft;

    if (!ownerWalletId) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: 'Owner Wallet ID is missing.',
        data: {},
      });
    }

    if (![userInfo.walletId, userInfo.walletName].includes(ownerWalletId)) {
      return utils.send(StatusCodes.UNAUTHORIZED, {
        message: 'User is not the owner.',
        data: {},
      });
    }

    const nftUpdated = await deleteNFT(nftId, ownerWalletId);
    return utils.send(StatusCodes.OK, {
      message: 'NFT deleted successfully.',
      data: nftUpdated,
    });
  } catch (e) {
    if (!e.status) {
      console.error(e.message, e);
    }
    return utils.send(
      e.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: 'Error in delete NFT',
        data: e.message,
      },
      e,
    );
  }
};
