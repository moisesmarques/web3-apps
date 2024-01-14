const AWS = require('aws-sdk');
const { nanoid } = require('nanoid');
const { isEmpty } = require('lodash');
const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');

const options = {};

/* if (process.env.IS_OFFLINE) {
  options = {
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
  }
} */

const dynamo = new AWS.DynamoDB.DocumentClient(options);

module.exports.main = async (event, context) => {
  const reqId = nanoid();
  const { appId } = event.pathParameters;

  if (!appId) {
    return utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "appId" is required.',
    });
  }

  try {
    const app = await dynamo.get({
      TableName: 'near-apps',
      Key: {
        appId,
      },
    }).promise();
    const { Item } = app;

    const connected_users = await dynamo.query({
      TableName: 'near-connected-apps',
      IndexName: 'appId-Index',
      KeyConditionExpression: 'appId = :appId',
      ExpressionAttributeValues: {
        ':appId': appId,
      },
      ReturnConsumedCapacity: 'TOTAL',
    }).promise();

    if (!isEmpty(Item)) {
      console.log(`reqId: ${reqId}, msg: App retrieved successfully!`);
      Item.connectedUsers = connected_users.Items.length;
      Item.created = new Date(Item.created).toISOString();
      Item.updated = new Date(Item.updated).toISOString();
      return utils.send(StatusCodes.OK, {
        success: true,
        message: 'App retrieved successfully!',
        data: Item,
      });
    }
    console.log(`reqId: ${reqId}, error: App not found for appId: ${appId} !`);
    return utils.send(StatusCodes.NOT_FOUND, {
      errors: [{
        message: `unable to find the app appId: ${appId} !`,
      }],
    });
  } catch (error) {
    console.log(`reqId: ${reqId}, error: Error to get app!`);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error to get app!',
      data: error.message,
    });
  }
};
