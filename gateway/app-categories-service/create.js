const { StatusCodes } = require('http-status-codes');
const schema = require('./validation/app-category-create-schema');
const utils = require('./utils');
const { createAppCategory } = require('./lib/model/app-category');

module.exports.handler = async (event) => {
  try {
    await utils.verifyAccessToken(event);
    const params = JSON.parse(event.body);
    const { error } = schema.validate(params);
    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'One or more fields are invalid.',
        errors: error.details.map((item) => item.message),
      });
    }
    const newCategory = await createAppCategory(params);
    return utils.send(StatusCodes.CREATED, {
      message: 'App Category created successfully.',
      data: newCategory,
    });
  } catch (error) {
    console.log(error);
    return utils.send(error.status || StatusCodes.INTERNAL_SERVER_ERROR, {
      message: error.message,
      data: error.data,
    });
  }
};
