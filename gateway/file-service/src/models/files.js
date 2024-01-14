// TODO: use alias to reference ~lib/ instead of ../../src/lib
const BPromise = require('bluebird');
const { chunk } = require('lodash');
const dynamodb = require('../lib/dynamodb');

const { TABLE_NAME_FILES } = process.env;

/**
 * Update or Insert a new file item in files table
 * @param {string} fileId - File UUID to update/insert
 * @param {string} userId - UserId who have access to this file
 * @param {Object} data - data to update or insert
 * @param {string} [conditionExpression] - any condition expression to be checked before upsert
 * @param {function} [paramsFn] - function to alter update parameters
 * @return {Promise<DocumentClient.AttributeMap>}
 */
async function upsertFile(
  { fileId, walletId, ...data },
  conditionExpression,
  paramsFn = (p) => p,
) {
  const { Attributes } = await dynamodb
    .update(
      paramsFn({
        TableName: TABLE_NAME_FILES,
        Key: {
          fileId,
          walletId,
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
}

/**
 * Retrieve a specific file using its fileId and walletId
 * @param {string} fileId - file id to retrieve
 * @param {string} walletId - wallet id that should hold the file
 * @return {Promise<DocumentClient.AttributeMap>}
 */
async function getFile(walletId, fileId) {
  const { Item } = await dynamodb
    .get({
      TableName: TABLE_NAME_FILES,
      Key: {
        fileId,
        walletId,
      },
    })
    .promise();
  return Item;
}

/**
 * Retrieves all files that belong to a walletId
 * @param userId
 * @return {Promise<DocumentClient.AttributeMap[]>}
 */
async function getFiles(walletId) {
  // TODO: add pagination & limit to the query
  const { Items } = await dynamodb
    .query({
      TableName: TABLE_NAME_FILES,
      KeyConditionExpression: 'walletId = :walletId',
      ExpressionAttributeValues: {
        ':walletId': walletId,
      },
    })
    .promise();
  return Items;
}

/**
 * Retrieves all files that belong to a walletId
 * @param walletId
 * @param folderId
 * @return {Promise<DocumentClient.AttributeMap[]>}
 */
async function getFilesByFolderId(walletId, folderId) {
  // TODO: add pagination & limit to the query
  const { Items } = await dynamodb
    .query({
      TableName: process.env.TABLE_NAME_FILES,
      IndexName: 'ownerId-walletId-index',
      KeyConditionExpression: 'ownerId = :walletId AND walletId = :walletId',
      FilterExpression: ['root', undefined, null].includes(folderId)
        ? undefined
        : 'folderId = :folderId',
      ExpressionAttributeValues: {
        ':walletId': walletId,
        ...(['root', undefined, null].includes(folderId)
          ? {}
          : { ':folderId': folderId }),
      },
    })
    .promise();
  return Items;
}

/**
 * Retrieves all shared files
 * @param walletId
 * @return {Promise<DocumentClient.AttributeMap[]>}
 */
async function getFilesShared(walletId, appid = null) {
  // TODO: add pagination & limit to the query
  const params = {
    TableName: TABLE_NAME_FILES,
    ScanIndexForward: true,
    IndexName: 'ownerId-fileId-index',
    KeyConditionExpression: '#ownerIdKey = :ownerIdKey',
    FilterExpression: '#walletIdKey <> :walletIdKey',
    ExpressionAttributeValues: {
      ':ownerIdKey': walletId,
      ':walletIdKey': walletId,
    },
    ExpressionAttributeNames: {
      '#ownerIdKey': 'ownerId',
      '#walletIdKey': 'walletId',
    },
  };
  if (appid) {
    params.FilterExpression += ' AND appId = :appId';
    params.ExpressionAttributeValues[':appId'] = appid;
  }
  const { Items } = await dynamodb.query(params).promise();
  return Items;
}

/**
 * Retrieves all shared files
 * @param walletId
 * @return {Promise<DocumentClient.AttributeMap[]>}
 */
async function getSharedFiles(walletId, appid = null) {
  // TODO: add pagination & limit to the query
  const params = {
    TableName: TABLE_NAME_FILES,
    KeyConditionExpression: 'walletId = :walletId',
    FilterExpression: 'ownerId <> :walletId',
    ExpressionAttributeValues: {
      ':walletId': walletId,
    },
  };
  if (appid) {
    params.FilterExpression += ' AND appId = :appId';
    params.ExpressionAttributeValues[':appId'] = appid;
  }
  const { Items } = await dynamodb.query(params).promise();
  return Items;
}

/**
 * Retrieves list of files using file hash
 * @param hash
 * @return {Promise<DocumentClient.AttributeMap[]>}
 */
async function getFilesByHash(hash) {
  // TODO: add pagination & limit to the query
  const { Items } = await dynamodb
    .query({
      TableName: TABLE_NAME_FILES,
      IndexName: 'hash-index',
      KeyConditionExpression: '#hash = :hash',
      ExpressionAttributeNames: {
        '#hash': 'hash',
      },
      ExpressionAttributeValues: {
        ':hash': hash,
      },
    })
    .promise();
  return Items;
}

/**
 * Retrieves list of files using file id
 * @param hash
 * @return {Promise<DocumentClient.AttributeMap[]>}
 */
async function getFilesByFileId(walletId, fileId) {
  // TODO: add pagination & limit to the query
  const { Items } = await dynamodb
    .query({
      TableName: process.env.TABLE_NAME_FILES,
      IndexName: 'ownerId-fileId-index',
      KeyConditionExpression: '#ownerId = :walletId AND #fileId = :fileId',
      ExpressionAttributeValues: {
        ':walletId': walletId,
        ':fileId': fileId,
      },
      ExpressionAttributeNames: {
        '#ownerId': 'ownerId',
        '#fileId': 'fileId',
      },
    })
    .promise();
  return Items;
}

async function deleteFile(walletId, fileId) {
  await dynamodb
    .delete({
      TableName: TABLE_NAME_FILES,
      Key: {
        fileId,
        walletId,
      },
      // ReturnValues: 'ALL_OLD'
    })
    .promise();
}

/**
 * Delete a file from all wallets based on its hash
 * @param {string} hash - Hash value of the file
 * @return {Promise<void>}
 */
async function deleteFileFromAllWallets(hash) {
  const { Items } = await dynamodb
    .query({
      TableName: TABLE_NAME_FILES,
      IndexName: 'hash-index',
      KeyConditionExpression: '#hash = :hash',
      ExpressionAttributeNames: {
        '#hash': 'hash',
      },
      ExpressionAttributeValues: {
        ':hash': hash,
      },
    })
    .promise();
  const keys = (Items || []).map((item) => ({
    walletId: item.walletId,
    fileId: item.fileId,
  }));
  // TODO: transaction has a limit batch it
  await dynamodb
    .transactWrite({
      TransactItems: keys.map((Key) => ({
        Delete: {
          TableName: TABLE_NAME_FILES,
          Key,
        },
      })),
    })
    .promise();
}

async function deleteFileFromAllWalletsV2(ownerId, fileId) {
  const { Items } = await dynamodb
    .query({
      TableName: TABLE_NAME_FILES,
      IndexName: 'ownerId-fileId-index',
      KeyConditionExpression: '#ownerId = :ownerId AND #fileId = :fileId',
      ExpressionAttributeNames: {
        '#ownerId': 'ownerId',
        '#fileId': 'fileId',
      },
      ExpressionAttributeValues: {
        ':ownerId': ownerId,
        ':fileId': fileId,
      },
    })
    .promise();
  const keys = (Items || []).map((item) => ({
    walletId: item.walletId,
    fileId: item.fileId,
  }));
  const newBatch = keys.map((key) => ({
    DeleteRequest: {
      Key: key,
    },
  }));
  const batches = chunk(newBatch, 25);
  const putErrors = [];
  await BPromise.map(
    batches,
    async (batch) => {
      const {
        UnprocessedItems: { [TABLE_NAME_FILES]: unprocessedItems },
      } = await dynamodb
        .batchWrite({
          // @ts-ignore
          RequestItems: {
            [TABLE_NAME_FILES]: batch,
          },
        })
        .promise();
      if (unprocessedItems && unprocessedItems.length) {
        putErrors.push(...unprocessedItems);
      }
    },
    { concurrency: 5 },
  );
}

async function transferFileTransaction(file1, file2) {
  const { fileId, walletId, ...data } = file1;
  const conditionExpression = {};
  const tableParams = {
    TableName: TABLE_NAME_FILES,
    Key: {
      fileId,
      walletId,
    },
    ...dynamodb.marshallUpdateRequest(data),
    ...(conditionExpression
      ? {
        ConditionExpression: conditionExpression,
      }
      : {}),
  };
  await dynamodb.transactWrite({
    TransactItems: [
      {
        Update: {
          tableParams,
        },
        Put: {
          Item: file2,
          TableName: TABLE_NAME_FILES,
        },
      },
    ],
  });
}

const batchDeleteFiles = async (walletId, files) => {
  console.log('batchDeleteFiles', files);

  const items = files.map(({ fileId }) => ({
    DeleteRequest: {
      Key: {
        walletId,
        fileId,
      },
    },
  }));

  console.log('items', items);

  const params = {
    RequestItems: {
      [process.env.TABLE_NAME_FILES]: items,
    },
  };

  await dynamodb.batchWrite(params).promise();
};

module.exports = {
  upsertFile,
  getFile,
  getFiles,
  deleteFile,
  deleteFileFromAllWallets,
  transferFileTransaction,
  getSharedFiles,
  getFilesShared,
  getFilesByHash,
  getFilesByFolderId,
  getFilesByFileId,
  batchDeleteFiles,
  deleteFileFromAllWalletsV2,
};
