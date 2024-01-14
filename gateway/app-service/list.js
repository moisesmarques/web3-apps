const AWS = require('aws-sdk');
const { nanoid } = require('nanoid');
const { get } = require('lodash');
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
  const querystring = event.queryStringParameters || {};
  const { search } = querystring;
  let params;
  if ((!search)) {
    params = {
      TableName: process.env.TABLE_NEAR_APPS,
    };
  } else if ((search && !/^([a-zA-Z0-9_-]{0,21})$/.test(search))) {
    return utils.send(StatusCodes.BAD_REQUEST, {
      errors: [{
        appName: 'Invalid search input received',
      }],
    });
  } else {
    params = {
      TableName: process.env.TABLE_NEAR_APPS,
      FilterExpression: 'begins_with(#searchName, :searchName)',
      ExpressionAttributeNames: {
        '#searchName': 'searchName',
      },
      ExpressionAttributeValues: {
        ':searchName': search.toLowerCase().trim(),
      },
    };
  }

  try {
    const scanResults = [];
    let items;
    let connected;
    do {
      // Aded Scan Because its Search We Can Not Use KeyConditionExpression With FilterExpression
      items = await dynamo.scan(params).promise();
      const itemList = get(items, 'Items', []);
      for (const item of itemList) {
        item.created = new Date(item.created).toISOString();
        item.updated = new Date(item.updated).toISOString();
        // uncomment below query code when index is created on
        // DYNAMO_APP_CONNECTED_APPS table for appId

        /*  connected = await dynamo.query({
          TableName: process.env.DYNAMO_APP_CONNECTED_APPS,
          IndexName: "appId-Index",
          KeyConditionExpression: "appId = :appId",
          ExpressionAttributeValues: {
            ":appId": item.appId
          },
          ReturnConsumedCapacity: "TOTAL",
        }).promise(); */

        connected = await dynamo.scan({
          TableName: process.env.DYNAMO_APP_CONNECTED_APPS,
          FilterExpression: 'appId = :appId',
          ExpressionAttributeValues: {
            ':appId': item.appId,
          },
        }).promise();
        item.connectedUsers = connected.Items.length;
        scanResults.push(item);
      }
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== 'undefined');

    const searchResult = search && Object.keys(scanResults[0] || {}).length < 1 && {
      error: 'unable to find the app',
    };

    return scanResults.length === 1 ? utils.send(StatusCodes.OK, {
      success: true,
      message: 'App retrieved successfully!',
      data: scanResults[0],
    }) : scanResults.length > 1 ? utils.send(StatusCodes.OK, {
      success: true,
      message: 'Apps retrieved successfully!',
      data: scanResults,
    }) : utils.send(StatusCodes.NOT_FOUND, {
      errors: [{
        message: searchResult.error,
      }],
    });
  } catch (error) {
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error to get apps!',
      data: error.message,
    });
  }
};
