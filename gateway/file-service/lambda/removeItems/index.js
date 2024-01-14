const chunk = require('lodash.chunk');
const BluebirdPromise = require('bluebird');

const Folders = require('../../src/models/folders');
const Files = require('../../src/models/files');

const deleteSubFolders = async (walletId, folderId) => {
  console.log('deleteSubFolders');

  const childFolders = await Folders.getChildFoldersByParentId(walletId, folderId);

  console.log('childFolders', childFolders);

  const batches = chunk(childFolders, 25);

  await BluebirdPromise.map(batches, (batch) => Folders.batchDeleteFolders(batch));
};

const deleteFiles = async (walletId, folderId) => {
  console.log('deleteFiles');

  const childFiles = await Files.getFilesByFolderId(walletId, folderId);

  console.log('childFiles', childFiles);

  const batches = chunk(childFiles, 25);

  await BluebirdPromise.map(batches, (batch) => Files.batchDeleteFiles(walletId, batch));
};

module.exports.handler = async (event) => {
  console.log(event);
  try {
    const walletId = event.Records[0].dynamodb.Keys.sk.S.replace('walletId=', '');
    const folderId = event.Records[0].dynamodb.Keys.pk.S.replace('FOLDER#id=', '');

    await deleteSubFolders(walletId, folderId);
    await deleteFiles(walletId, folderId);
  } catch (e) {
    console.error(e);
  }
};
