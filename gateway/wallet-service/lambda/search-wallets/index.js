const { StatusCodes } = require('http-status-codes');
const { clientFactory } = require('../../src/helpers/elasticsearch');
const HttpError = require('../../src/helpers/exception/error');
const utils = require('../../src/helpers/utils');

const { ES_ENDPOINT, ES_WALLET_INDEX } = process.env;

const esClient = clientFactory(ES_ENDPOINT);

module.exports.handler = async (event) => {
  const {
    pathParameters: { searchTerm },
  } = event;

  try {
    if (!searchTerm || searchTerm === 'null') {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'searchTerm missing in the request!',
      );
    }

    const wallets = await esClient.search({
      index: ES_WALLET_INDEX,
      body: {
        query: {
          match_bool_prefix: {
            walletId: {
              query: searchTerm,
            },
          },
        },
      },
    });

    return utils.send(StatusCodes.OK, wallets);
  } catch (e) {
    return utils.send(
      e.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: e.message,
        data: e.data,
      },
      e,
    );
  }
};
