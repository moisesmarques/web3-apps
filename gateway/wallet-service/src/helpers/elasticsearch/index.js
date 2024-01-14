const { Client } = require('@opensearch-project/opensearch');
const memoize = require('lodash/memoize');
const AwsConnector = require('./AwsEsConnector');

module.exports.clientFactory = (endpoint) => new Client({
  node: endpoint,
  Connection: AwsConnector,
});

module.exports.getWalletsIndexName = (id) => `wallets-${id}`.toLowerCase();

module.exports.indexExists = (client) => async (index) => {
  const { body: exists } = await client.indices.exists({ index });

  return exists;
};

// we use a memoized version to avoid always checking for index existence
const memoizedIndexExists = (client) => memoize(indexExists(client));

/**
 *
 */
const indexConfigs = {
  wallets: {
    settings: {
      index: {
        number_of_shards: 3,
        number_of_replicas: 2,
      },
    },
  },
};

/**
 *
 */
module.exports.createIndex = (client) => async (index, type) => {
  const indexConfig = indexConfigs[type];

  if (!indexConfig) {
    throw new Error(`unknow type ${type}`);
  }

  return client.indices.create({
    index,
    body: indexConfig,
  });
};

/**
 *
 */
module.exports.getOrCreateIndex = (client) => async (index, type) => {
  const exists = await memoizedIndexExists(client)(index);

  if (exists) {
    return true;
  }

  return createIndex(client)(index, type);
};

/**
 *
 */
module.exports.convertDynamoDBReservationToIndexItem = (recordItem) => {
  const {
    __typename, id: cursor, fees, ...record
  } = recordItem;

  return {
    ...record,
    cursor,
  };
};
