const AWS = require('aws-sdk');
const { nanoid } = require('nanoid');
const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');

const options = {};

// if (process.env.IS_OFFLINE) {
//     options = {
//         region: 'us-east-1',
//         endpoint: 'http://localhost:8000'
//     }
// }

const dynamo = new AWS.DynamoDB.DocumentClient(options);

module.exports.main = async (event, context) => {
  const reqId = nanoid();

  try {
    await utils.verifyAccessToken(event);
    const { queryStringParameters = {} } = event;
    const { search } = queryStringParameters;
    let params;
    if (!search || (search && !(/^[a-zA-Z0-9-_]{21}$/.test(search)))) {
      console.log('Missing/Invalid query parameter');
      return utils.send(StatusCodes.BAD_REQUEST, {
        errors: [
          {
            categoryId: 'Missing/Invalid categoryId query parameter',
          },
        ],
      });
    }
    params = {
      TableName: 'near-apps',
      IndexName: 'categoryId-Index',
      KeyConditionExpression: 'categoryId = :categoryId',
      ExpressionAttributeValues: {
        ':categoryId': search,
      },
      ReturnConsumedCapacity: 'TOTAL',
    };

    const { Items = [] } = await dynamo.query(params).promise();
    console.log(Items);
    console.log(`reqId: ${reqId}, msg: Apps found successfully!`);
    return Items.length > 0 ? utils.send(
      StatusCodes.OK,
      {
        success: true,
        message: 'Apps found successfully!',
        data: Items,
      },
    ) : utils.send(
      StatusCodes.OK,
      {
        success: true,
        message: 'No apps found!',
        data: Items,
      },
    );
  } catch (error) {
    console.log(`reqId: ${reqId}, error: Error in getting apps!`);
    if (!error.status) {
      console.error(error.message, error);
    }
    return utils.send(
      error.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: 'Error in getting Apps!',
        data: error.message,
      },
      error,
    );
  }
};
