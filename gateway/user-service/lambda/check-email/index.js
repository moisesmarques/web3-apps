const { StatusCodes } = require('http-status-codes');
const schema = require('../../validation/check-email-schema');
const utils = require('../../utils');

module.exports.handler = async (event) => {
  try {
    const params = JSON.parse(event.body);
    const { error } = schema.validate(params, { abortEarly: false });

    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        errors: error.details.map((item) => item.message),
      });
    }

    const hasEmail = await utils.checkEmailExists(params.email);

    if (hasEmail) {
      const message = 'email address already exists';
      return utils.send(StatusCodes.CONFLICT, { message });
    }

    return utils.send(StatusCodes.OK, {
      message: 'email address does not exist',
    });
  } catch (err) {
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: `${err.message}`,
    });
  }
};
