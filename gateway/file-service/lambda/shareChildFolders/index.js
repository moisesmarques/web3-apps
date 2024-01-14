// eslint-disable-next-line import/no-extraneous-dependencies
const DynamoDB = require('aws-sdk/clients/dynamodb');
const BPromise = require('bluebird');

const Folders = require('../../src/models/folders');

const parse = DynamoDB.Converter.unmarshall;

const processRecord = (record) => {
  const { dynamodb, eventName } = record;
  const obj = parse(dynamodb.NewImage);
  return { ...obj, eventName };
};
module.exports.handler = async (event) => {
  console.log('event', JSON.stringify(event));
  const item = processRecord(event.Records[0]);
  try {
    if (item.pk && item.pk.includes('SHARED_FOLDER')) {
      const folders = await Folders.getChildFoldersByFolderId(
        item.ownerId,
        item.id,
      );
      if (folders.length) {
        await BPromise.map(
          folders,
          async (folder) =>
            // eslint-disable-next-line implicit-arrow-linebreak
            Folders.upsertFolder({
              ...folder,
              pk: `SHARED_FOLDER#parentFolderId=${item.id}`,
              sk: `walletId=${item.walletId}`,
              ownerId: item.ownerId,
              walletId: item.walletId,
              created: +new Date(),
              sharedAt: new Date().toISOString(),
              pk1: `SHARED_FOLDER#receiverWalletId=${item.walletId}`,
              sk1: `id=${folder.id}`,
            }),
          {
            concurrency: 5,
          },
          // eslint-disable-next-line function-paren-newline
        );
      }
    }
  } catch (e) {
    console.error(e);
  }
};

/*

root/

*/
