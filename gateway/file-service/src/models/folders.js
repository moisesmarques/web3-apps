const dynamodb = require('../lib/dynamodb');

const { TABLE_NAME_FOLDERS } = process.env;

module.exports.getFolders = async (object) => {
  const data = await dynamodb.query(object).promise();
  return data;
};

/**
 * Retrieve a specific folder using its folderId and walletId
 * @param {string} folderId - folder id to retrieve
 * @param {string} walletId - wallet id that should hold the folder
 * @return {Promise<DocumentClient.AttributeMap>}
 */

/*
TODO:
  we are fetching folder by id why we are using .query??
  We should use get function, as we only need to return one folder.
  Not chaning right now as other will be affected.
*/
module.exports.getFolderById = async (folderId) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  dynamodb
    .query({
      TableName: process.env.TABLE_NAME_FOLDERS,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': `FOLDER#id=${folderId}` },
    })
    .promise();

/**
 * Retrieve shared folders using its parentfolderId
 * @param {string} folderId - parentFolderId
 * @return {Promise<DocumentClient.AttributeMap>}
 */
module.exports.getSharedFoldersByParentId = async (folderId) => {
  const { Items } = await dynamodb
    .query({
      TableName: TABLE_NAME_FOLDERS,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `SHARED_FOLDER#parentFolderId=${folderId}`,
      },
    })
    .promise();
  return Items;
};

/**
 * Retrieve folder shares using its folderId and ownerWalletId
 * @param {string} folderId - parentFolderId
 * @param {string} ownerWalletId - ownerWalletId
 * @return {Promise<DocumentClient.AttributeMap>}
 */
module.exports.getFolderShares = async (folderId, ownerWalletId) => {
  const { Items } = await dynamodb
    .query({
      TableName: TABLE_NAME_FOLDERS,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `SHARED_FOLDER#ownerWalletId=${ownerWalletId}#id=${folderId}`,
      },
    })
    .promise();
  return Items;
};

/**
 * Retrieve a shared folder using its folderId and receiverWalletId
 * @param {string} folderId - folder id
 * @param {string} receiverWalletId - wallet id that the folder was shared to
 * @return {Promise<DocumentClient.AttributeMap>}
 */
module.exports.getSharedFolder = async (folderId, receiverWalletId) => {
  const { Items } = await dynamodb
    .query({
      TableName: process.env.TABLE_NAME_FOLDERS,
      IndexName: 'GSI1',
      KeyConditionExpression: 'pk1 = :pk1 AND sk1 = :sk1',
      ExpressionAttributeValues: {
        ':pk1': `SHARED_FOLDER#receiverWalletId=${receiverWalletId}`,
        ':sk1': `id=${folderId}`,
      },
    })
    .promise();
  return Items.length ? Items[0] : false;
};

module.exports.deleteSharedFolder = async (
  folderId,
  ownerWalletId,
  receiverWalletId,
) => {
  const data = await dynamodb
    .delete({
      TableName: process.env.TABLE_NAME_FOLDERS,
      Key: {
        pk: `SHARED_FOLDER#ownerWalletId=${ownerWalletId}#id=${folderId}`,
        sk: `walletId=${receiverWalletId}`,
      },
    })
    .promise();
  return data;
};

module.exports.deleteSharedChildFolders = async (
  parentFolderId,
  receiverWalletId,
) => {
  const data = await dynamodb
    .delete({
      TableName: process.env.TABLE_NAME_FOLDERS,
      Key: {
        pk: `SHARED_FOLDER#parentFolderId=${parentFolderId}`,
        sk: `walletId=${receiverWalletId}`,
      },
    })
    .promise();
  return data;
};

/**
 * Retrieves all files that belong to a walletId
 * @param walletId
 * @param folderId
 * @return {Promise<DocumentClient.AttributeMap[]>}
 */
module.exports.getChildFoldersByFolderId = async (walletId, folderId) => {
  // TODO: add pagination & limit to the query
  const { Items } = await dynamodb
    .query({
      TableName: process.env.TABLE_NAME_FOLDERS,
      IndexName: 'GSI1',
      KeyConditionExpression: 'pk1 = :pk1',
      // eslint-disable-next-line max-len
      // FilterExpression: 'parentFolderId = :folderId AND walletId = :walletId AND ownerId = :walletId',
      ExpressionAttributeValues: {
        ':pk1': ['root', undefined, null].includes(folderId)
          ? `FOLDER#walletId=${walletId}`
          : `FOLDER#walletId=${walletId}#parentFolderId=${folderId}`,
      },
    })
    .promise();
  return Items;
};

module.exports.createFolder = async (folderObject) => {
  await dynamodb
    .put({
      TableName: TABLE_NAME_FOLDERS,
      Item: folderObject,
    })
    .promise();
  return folderObject;
};

module.exports.getChildFoldersByParentId = async (walletId, parentFolderId) => {
  const { Items } = await dynamodb
    .query({
      TableName: process.env.TABLE_NAME_FOLDERS,
      IndexName: 'GSI1',
      KeyConditionExpression: 'pk1= :pk1',
      ExpressionAttributeValues: {
        ':pk1': `FOLDER#walletId=${walletId}#parentFolderId=${parentFolderId}`,
      },
    })
    .promise();
  return Items;
};

module.exports.deleteFolder = async (walletId, folderId) => {
  const data = await dynamodb
    .delete({
      TableName: process.env.TABLE_NAME_FOLDERS,
      Key: {
        pk: `FOLDER#id=${folderId}`,
        sk: `walletId=${walletId}`,
      },
    })
    .promise();
  console.log({
    TableName: process.env.TABLE_NAME_FOLDERS,
    Key: {
      pk: `FOLDER#id=${folderId}`,
      sk: `walletId=${walletId}`,
    },
  });
  return data;
};

module.exports.batchDeleteFolders = async (folders) => {
  console.log('batchDeleteFolders', folders);

  const items = folders.map(({ pk, sk }) => ({
    DeleteRequest: {
      Key: {
        sk,
        pk,
      },
    },
  }));

  console.log('items', items);

  const params = {
    RequestItems: {
      [process.env.TABLE_NAME_FOLDERS]: items,
    },
  };

  await dynamodb.batchWrite(params).promise();
};

/**
 * Update or Insert a new folder item in near-storage table
 * @param {string} folderId - File UUID to update/insert
 * @param {string} userId - UserId who have access to this file
 * @param {Object} data - data to update or insert
 * @param {string} [conditionExpression] - any condition expression to be checked before upsert
 * @param {function} [paramsFn] - function to alter update parameters
 * @return {Promise<DocumentClient.AttributeMap>}
 */
module.exports.upsertFolder = async (
  { pk, sk, ...data },
  conditionExpression,
  paramsFn = (p) => p,
) => {
  const { Attributes } = await dynamodb
    .update(
      paramsFn({
        TableName: TABLE_NAME_FOLDERS,
        Key: {
          pk,
          sk,
        },
        ...dynamodb.marshallUpdateRequest(data),
        ...(conditionExpression
          ? {
              ConditionExpression: conditionExpression,
            }
          : {}),
        ReturnValues: 'ALL_NEW',
      }),
    )
    .promise();

  return Attributes;
};
