const AWS = require('aws-sdk');
const { StatusCodes } = require('http-status-codes');
const { getUserByWallet } = require('./lib/model/wallets');
const utils = require('./utils');

const dynamo = new AWS.DynamoDB.DocumentClient();
module.exports.handler = async (event) => {
  console.log(JSON.stringify(event));

  try {
    let userId;
    let contactId = '';

    if (typeof (event.queryStringParameters) !== 'undefined' && event.queryStringParameters != null) {
      contactId = event.queryStringParameters.contactId;
      const contactDetails = await dynamo.query({
        TableName: process.env.DYNAMO_CONTACT_TABLE,
        KeyConditionExpression: 'contactId = :contactId',
        ExpressionAttributeValues: {
          ':contactId': contactId,
        },
        ReturnConsumedCapacity: 'TOTAL',
      }).promise();

      if (!contactDetails.Items.length) {
        return utils.send(StatusCodes.OK, {
          message: 'ContactId Not found!',
        });
      }
      userId = contactDetails.Items[0].userId;
    } else {
      const { walletId } = await utils.verifyAccessToken(event);
      userId = (await getUserByWallet(walletId)).userId;
    }
    if (!userId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'userId not found',
      });
    }
    const { Items } = await dynamo.query({
      TableName: process.env.DYNAMO_APP_CONNECTED_APPS,
      IndexName: 'userId-Index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ReturnConsumedCapacity: 'TOTAL',
    }).promise();

    if (!Items.length) {
      return utils.send(StatusCodes.OK, {
        message: 'Apps Not found!',
        total_connected_apps: Items.length,
      });
    }
    let appDetails = [];
    appDetails = await appDetailsFunc(Items);

    return utils.send(StatusCodes.OK, {
      message: 'Apps retrieved successfully!',
      data: appDetails,
      total_connected_apps: appDetails.length,
    });
  } catch (error) {
    return utils.send(error.status || StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error retreiving apps from the user!',
      data: error.message,
    });
  }
};
async function appDetailsFunc(Items) {
  const details = [];
  Items.map((record) => {
    details.push(dynamo.get({
      TableName: 'near-apps',
      Key: {
        appId: record.appId,
      },
      ReturnConsumedCapacity: 'TOTAL',
    }).promise());
  });
  const resolvedata = Promise.allSettled(details);
  const resolvedetails = (await resolvedata).map((record) => {
    if (record.status == 'fulfilled') {
      return record.value.Item;
    }
  });
  return resolvedetails;
}
