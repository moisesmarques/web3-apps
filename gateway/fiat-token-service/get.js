const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');
const { getFiatPrice } = require('./lib/model/fiat-token');

module.exports.handler = async (event) => {
  try {
    const { pathParameters: { symbol } } = event;
    if (!symbol) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: 'The path parameter "symbol" is required.',
      });
    }

    const fiat = await getFiatPrice(symbol);

    if (!fiat || !fiat.active) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: `Not available to fetch fiat price of "${symbol}" token.`,
      });
    }
    return utils.send(StatusCodes.OK, fiat);
  } catch (error) {
    return utils.send(error.status || StatusCodes.INTERNAL_SERVER_ERROR, {
      message: error.message,
      data: error.data,
    });
  }
};
