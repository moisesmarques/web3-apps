const AWS = require('aws-sdk');
const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');

let options = {};

if (process.env.IS_OFFLINE) {
  options = {
    region: 'us-east-1',
    endpoint: 'http://localhost:8000',
  };
}

const dynamo = new AWS.DynamoDB.DocumentClient(options);
module.exports.handler = async (event) => {
  console.log('Event', event);
  const { appId } = event.pathParameters;
  const { userId } = await utils.verifyAccessToken(event);

  if (!appId) {
    return utils.send(StatusCodes.BAD_REQUEST, {
      message: 'appId required in path Param',
    });
  }
  if (!userId) {
    return utils.send(StatusCodes.BAD_REQUEST, {
      message: 'you are not authorised to perform this action!',
    });
  }

  try {
    const { Items = [] } = await dynamo.query({
      TableName: 'near-connected-apps',
      IndexName: 'userId-Index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ReturnConsumedCapacity: 'TOTAL',
    }).promise();

    for (const item of Items) {
      if (item.appId === appId) {
        await dynamo.delete({
          TableName: 'near-connected-apps',
          Key: {
            connectionId: item.connectionId,
          },
        }).promise();
        console.log('msg: App removed successfully!');
        return utils.send(StatusCodes.OK, {
          message: 'App removed successfully!',
        });
      }
    }
    console.log('msg: App not found in your account!');
    return utils.send(StatusCodes.BAD_REQUEST, {
      message: 'you are not authorised to perform this action, App does not found in your account!',
    });
  } catch (error) {
    console.log('error: Error deleting app from the user');
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error deleting app from the user',
      data: error.message,
    });
  }
};
