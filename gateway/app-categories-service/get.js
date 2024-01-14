const AWS = require('aws-sdk');
const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');
const { getAppCategory } = require('./lib/model/app-category');

module.exports.handler = async (event) => {
  const { categoryId } = event.pathParameters;

  if (!categoryId) {
    return utils.send(StatusCodes.BAD_REQUEST, {
      message: 'The path parameter "categoryId" is required.',
    });
  }

  try {
    await utils.verifyAccessToken(event);

    const Item = await getAppCategory(categoryId);

    if (Item) {
      return utils.send(StatusCodes.OK, {
        success: true,
        message: 'App Category retrieved successfully!',
        data: Item,
      });
    }

    return utils.send(StatusCodes.NOT_FOUND, {
      errors: [{
        message: `unable to find the app appCategoryId: ${categoryId} !`,
      }],
    });
  } catch (error) {
    console.log(`reqId: ${categoryId}, error: Error to get appCategory by Id!`);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Error to get app!',
      data: error.message,
    });
  }
};
