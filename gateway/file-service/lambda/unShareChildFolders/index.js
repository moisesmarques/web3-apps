// eslint-disable-next-line import/no-extraneous-dependencies
const DynamoDB = require('aws-sdk/clients/dynamodb');
const BPromise = require('bluebird');

const Folders = require('../../src/models/folders');

const parse = DynamoDB.Converter.unmarshall;

const processRecord = (record) => {
  const { dynamodb, eventName } = record;
  const obj = parse(dynamodb.OldImage);
  return { ...obj, eventName };
};
module.exports.handler = async (event) => {
  console.log('event', JSON.stringify(event));
  const item = processRecord(event.Records[0]);
  try {
    if (item.pk && item.pk.includes('SHARED_FOLDER')) {
      const folders = await Folders.getSharedFoldersByParentId(item.id);

      if (folders?.length) {
        const res = await BPromise.map(
          folders,
          async (folder) =>
            // eslint-disable-next-line implicit-arrow-linebreak
            Folders.deleteSharedChildFolders(item.id, folder.walletId),
          // eslint-disable-next-line function-paren-newline
        );
      }
    }
  } catch (e) {
    console.error(e);
  }
};
