const DynamoDB = require('aws-sdk/clients/dynamodb');
const { nanoid } = require('nanoid');

const { TABLE_NAME_NFT_ACCESS_REQUESTS } = process.env;

const docClient = new DynamoDB.DocumentClient();

exports.checkIfRequestExists = async (nftId, requesterId) => {
  const params = {
    TableName: TABLE_NAME_NFT_ACCESS_REQUESTS,
    IndexName: 'nftId-Index',
    FilterExpression: 'requesterId = :requesterId AND #status = :status',
    KeyConditionExpression: 'nftId = :nftId',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':nftId': nftId,
      ':requesterId': requesterId,
      ':status': 'pending',
    },
  };
  const { Item } = await docClient.query(params).promise();
  return !!Item;
};

exports.createAccessRequest = async (data) => {
  const Item = { ...data, requestId: nanoid(), createdAt: +new Date() };
  const params = {
    TableName: TABLE_NAME_NFT_ACCESS_REQUESTS,
    Item,
  };
  await docClient.put(params).promise();
  return Item;
};

exports.getAccessRequest = async (nftId) => {
  const nftRequests = await docClient
    .query({
      TableName: TABLE_NAME_NFT_ACCESS_REQUESTS,
      IndexName: 'nftId-Index',
      KeyConditionExpression: 'nftId = :nftId',
      ExpressionAttributeValues: {
        ':nftId': nftId,
      },
      ReturnConsumedCapacity: 'TOTAL',
    })
    .promise();

  return nftRequests;
};

exports.getAccessRequestByRequestId = async (requestId) => {
  const params = {
    TableName: TABLE_NAME_NFT_ACCESS_REQUESTS,
    Key: {
      requestId,
    },
  };
  const { Item } = await docClient.get(params).promise();
  return Item;
};

exports.upsertRequest = async (data) => {
  const { Attributes } = await docClient
    .update({
      TableName: TABLE_NAME_NFT_ACCESS_REQUESTS,
      Key: { requestId: data.requestId },
      UpdateExpression: 'set #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': data.status,
      },
      ReturnValues: 'ALL_NEW',
    })
    .promise();

  return Attributes;
};
