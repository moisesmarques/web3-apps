const { StatusCodes } = require('http-status-codes');
const { nanoid } = require('nanoid');
const utils = require('./utils');
const { createFiatToken } = require('./lib/model/fiat-token');

const reqId = nanoid();
module.exports.handler = async (event) => {
  try {
    const { symbol } = JSON.parse(event.body);
    console.log(`reqId: ${reqId}, Create requestParams`, symbol);

    await createFiatToken(symbol);
    return utils.send(StatusCodes.CREATED, {
      message: `"${symbol}" token created successfully.`,
    });
  } catch (error) {
    console.log(`reqId: ${reqId}, Create err`, error);
    return utils.send(error.status || StatusCodes.INTERNAL_SERVER_ERROR, {
      message: error.message,
      data: error.data,
    });
  }
};
