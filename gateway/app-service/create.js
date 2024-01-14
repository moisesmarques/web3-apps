const DynamoDB = require('aws-sdk/clients/dynamodb');
const { nanoid } = require('nanoid');
const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');
const { createAppSchema } = require('./schemaValidation');

const dynamo = new DynamoDB.DocumentClient();

module.exports.main = async (event) => {
  const reqId = nanoid();
  try {
    await utils.verifyAccessToken(event);
    const body = JSON.parse(event.body);
    const { error } = createAppSchema.validate(body, { abortEarly: false });
    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        errors: error.details.map((item) => item.message),
      });
    }

    // TODO: validate categoryId by calling getCategoryId from app-category-service

    const appId = nanoid();
    const timeStamp = +new Date();
    const { appName } = body;
    const searchName = appName.toLowerCase().trim();
    const Item = {
      ...body, searchName, appId, created: timeStamp, updated: timeStamp,
    };
    await dynamo
      .put({
        TableName: 'near-apps',
        Item,
      })
      .promise();
    console.log(`reqId: ${reqId}, msg: app created successfully!`);
    return utils.send(StatusCodes.CREATED, {
      success: true,
      message: 'App successfully created!',
      data: Item,
    });
  } catch (err) {
    console.log(`reqId: ${reqId}, error: Error adding app`);
    return utils.send(
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: 'Error adding app!',
        data: err.message,
      },
      err,
    );
  }
};
