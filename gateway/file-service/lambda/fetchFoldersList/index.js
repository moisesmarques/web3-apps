/* eslint-disable no-await-in-loop */
/* eslint-disable semi */
/* eslint-disable no-empty */
// eslint-disable-next-line import/no-extraneous-dependencies

const { StatusCodes } = require('http-status-codes');
const utils = require('../../utils');
const Folders = require('../../src/models/folders')
const { verifyUser } = require('../../user');

module.exports.handler = async (event) => {
  /**
   * 1. Fetch all folders by walletId
   * 2. Return data
   */
  console.log(event);
  try {
    const {
      pathParameters: { walletId },
    } = event;
    await verifyUser(event);

    const params = {
      TableName: process.env.TABLE_NAME_FOLDERS,
      KeyConditionExpression: 'walletId = :walletId',
      ExpressionAttributeValues: {
        ':walletId': walletId,
      },
    }
    const scanResults = [];
    let data;
    let items;
    do {
      data = await Folders.getFolders(params);
      items = data.Items;
      scanResults.push(...items);
      params.ExclusiveStartKey = data.LastEvaluatedKey;
    } while (typeof data.LastEvaluatedKey !== 'undefined');
    return scanResults
  } catch (e) {
    return utils.send(
      e.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: e.message,
        data: e.data,
      },
      e,
    );
  }
};
