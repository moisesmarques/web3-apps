const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');
const { deleteAppCategory } = require('./lib/model/app-category');

module.exports.handler = async (event) => {
  try {
    await utils.verifyAccessToken(event);
    const {
      pathParameters: { categoryId },
    } = event;
    if (!categoryId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "categoryId" is required.',
      });
    }
    await deleteAppCategory(categoryId);
    return utils.send(StatusCodes.OK, {
      message: 'App category deleted successfully.',
    });
  } catch (error) {
    console.error(error.stack);
    return utils.send(error.status || StatusCodes.INTERNAL_SERVER_ERROR, {
      message: error.message,
      data: error.data,
    });
  }
};
