const AWS = require('aws-sdk');
const { nanoid } = require('nanoid');
const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');
const schema = require('./lib/validation/app-connection-schema');
const HttpError = require('./lib/error');

const options = {};

const dynamo = new AWS.DynamoDB.DocumentClient(options);

module.exports.handler = async (event) => {
  console.log(event);
  const reqId = nanoid(); // for msg logging
  try {
    const timeStamp = new Date().getTime();

    const { userId } = await utils.verifyAccessToken(event);
    const appConnectionBody = JSON.parse(event.body);

    if (!userId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'You are not authorized to perform this operation',
      );
    }
    const { error } = schema.validate(appConnectionBody);

    if (error) {
      console.log(`reqId: ${reqId}, error: One or more fields are invalid.`);
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'One or more fields are invalid.',
        data: error.details,
      });
    }

    const { appId } = appConnectionBody;
    const { Items = [] } = await dynamo.query({
      TableName: 'near-connected-apps',
      IndexName: 'userId-Index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ReturnConsumedCapacity: 'TOTAL',
    }).promise();

    try {
      Items.forEach((item) => {
        if (item.appId === appId) {
          throw new Error('App already connected to the user');
        }
      });
    } catch (error) {
      console.log(`reqId: ${reqId}, error: Error connecting app to the user`);
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Error connecting apps to the user!',
        data: error.message,
      });
    }

    await dynamo.put({
      TableName: 'near-connected-apps',
      Item: {
        connectionId: reqId,
        appId,
        userId,
        status: 'active',
        created: timeStamp,
        updated: timeStamp,
      },
    }).promise();

    console.log(`reqId: ${reqId}, msg: Connection added successfully!`);
    return utils.send(StatusCodes.OK, {
      message: 'App connects successfully!',
      data: {
        connectionId: reqId,
      },
    });
  } catch (error) {
    console.log(`reqId: ${reqId}, error: Error connecting app to the user`);
    return utils.send(error.status || StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error connecting apps to the user!',
      data: error.message,
    });
  }
};
