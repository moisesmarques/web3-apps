const AWS = require('aws-sdk');
const { nanoid } = require('nanoid');
const { isEmpty } = require('lodash');
const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');

const options = {};

// if (process.env.IS_OFFLINE) {
//   options = {
//     region: 'us-east-1',
//     endpoint: 'http://localhost:8000'
//   }
// }

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
    const appActionMapParam = {
      TableName: process.env.DYNAMO_APP_ACTION_MAPPING_TABLE,
      KeyConditionExpression: '#appId = :appId',
      ExpressionAttributeNames: {
        '#appId': 'appId',
      },
      ExpressionAttributeValues: {
        ':appId': appId,
      },
    };

    const { Items = [] } = await dynamo.query(appActionMapParam).promise();
    if (Items.length > 0) {
      const actionIds = Items.map((item) => item.actionId);
      console.log(`reqId: ${reqId}, msg: App actions retrieved successfully!`);
      const actions = await fetchAppActions(actionIds);
      return utils.send(StatusCodes.OK, {
        success: true,
        message: 'App actions retrieved successfully!',
        data: { appId, actions },
      });
    }

    console.log(`reqId: ${reqId}, error: App actions not found for appId: ${appId} !`);
    return utils.send(StatusCodes.NOT_FOUND, {
      errors: [{
        message: `unable to find the app actions for appId: ${appId} !`,
      }],
    });
  } catch (error) {
    // console.log(`reqId: ${reqId}, error: Error to get app actions!`);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error to get app actions!',
      data: error.message,
    });
  }
};

const fetchAppActions = async (actionIds) => {
  let keyConditionExpression = '';
  const expressionAttributeValues = {};
  actionIds.forEach((actionId, index) => {
    keyConditionExpression += ` ${index != 0 ? 'Or' : ''} #actionId = :${index}`;
    expressionAttributeValues[`:${index}`] = actionId;
  });
  const appActionMasterParam = {
    TableName: process.env.DYNAMO_APP_ACTION_TABLE,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeNames: {
      '#actionId': 'actionId',
    },
    ExpressionAttributeValues: expressionAttributeValues,
  };
  const queryResults = await dynamo.query(appActionMasterParam).promise();
  return queryResults.Items;
};
