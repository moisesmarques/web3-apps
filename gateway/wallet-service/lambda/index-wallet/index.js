const { flattenDeep, map, omit } = require('lodash');
const BPromise = require('bluebird');
const Converter = require('aws-sdk/lib/dynamodb/converter');
const { clientFactory } = require('../../src/helpers/elasticsearch');

const { ES_ENDPOINT, ES_WALLET_INDEX } = process.env;

const esClient = clientFactory(ES_ENDPOINT);

async function processRecord(record) {
  const { dynamodb: { NewImage } } = record;
  // TODO: handle item deletion
  const index = ES_WALLET_INDEX;
  const item = Converter.unmarshall(NewImage);
  return [
    { index: { _index: index, _id: item.walletId } },
    item,
  ];
}

module.exports.handler = async (event) => {
  console.log('event', JSON.stringify(event));
  const { Records } = event;

  // Create index if necessary
  const indexCreationResult = await esClient.indices.create(
    {
      index: ES_WALLET_INDEX,
      body: {
        settings: {
          index: {
            number_of_shards: 3,
            number_of_replicas: 2,
          },
        },
      },
    },
    { ignore: [400] },
  );
  // Generate bulk index bodies
  const bodies = await BPromise.map(Records, processRecord);
  const bulkBody = flattenDeep(bodies);
  if (!bulkBody.length) {
    return {};
  }

  try {
    const { body: bulkResponse } = await esClient.bulk({ refresh: true, body: bulkBody });

    // Analyse response
    if (bulkResponse.errors) {
      const erroredDocuments = [];
      // The items array has the same order of the dataset we just indexed.
      // The presence of the `error` key indicates that the operation
      // that we did for the document has failed.
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            // If the status is 429 it means that you can retry the document,
            // otherwise it's very likely a mapping error, and you should
            // fix the document before to try it again.
            status: action[operation].status,
            error: action[operation].error,
            operation: bulkBody[i * 2],
            document: bulkBody[i * 2 + 1],
          });
        }
      });
      Log.error('Index operation failed', erroredDocuments);
      throw new CoreErrors.GenericError(
        'BULK_INDEX_OPERATION_FAILED',
        `Got ${erroredDocuments.length} errors during bulk index`,
      );
    }
    return bulkResponse;
  } catch (e) {
    Log.error('Bulk index failed', { ...e.meta.body, bulkBody }, e);
    throw e;
  }
};
