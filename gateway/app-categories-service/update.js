const DynamoDB = require('aws-sdk/clients/dynamodb');
const { nanoid } = require('nanoid');
const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');
const { updateAppCategorySchema } = require('./schemaValidation');
const { updateAppCategory } = require('./lib/model/app-category');

module.exports.main = async (event) => {
  const reqId = nanoid();
  const { categoryId } = event.pathParameters;
  const appCategoryJSON = JSON.parse(event.body);

  try {
    await utils.verifyAccessToken(event);
    if (!categoryId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "categoryId" is required.',
      });
    }

    const { error } = updateAppCategorySchema.validate(appCategoryJSON);

    if (error) {
      console.log(`reqId: ${reqId}, error: One or more fields are invalid.`);
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'One or more fields are invalid.',
        data: error.details,
      });
    }

    const data = await updateAppCategory(appCategoryJSON, categoryId);

    if (data) {
      console.log(`reqId: ${reqId}, msg: App Category updated successfully!`);
      return utils.send(StatusCodes.OK, {
        message: 'App Category updated successfully!',
        data,
      });
    }

    console.log(`reqId: ${reqId}, error: Unable to update App Category`);
    return utils.send(StatusCodes.NOT_FOUND, {
      message: 'Unable to update App Category',
      data: {},
    });
  } catch (err) {
    console.log(err);
    if (err.code === 'ConditionalCheckFailedException') {
      console.log(
        `reqId: ${reqId}, error: Error updating categoryId:${categoryId}  not found `,
      );
      return utils.send(StatusCodes.NOT_FOUND, {
        message: `Error updating App Category. categoryId: ${categoryId} not found!`,
      });
    }
    console.log(`reqId: ${reqId}, error: Error updating App Category`);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error updating App Category!',
      data: err.message,
    }, err);
  }
};
