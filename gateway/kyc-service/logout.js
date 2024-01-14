const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');

module.exports.handler = async () => {
  try {
    const response = {
      message: 'You have successfully logged out',
    };

    return utils.send(StatusCodes.OK, response);
  } catch (err) {
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: 'Ops...',
    });
  }
};
