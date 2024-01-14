const dynamoDb = require('aws-sdk/clients/dynamodb');
const { nanoid } = require('nanoid');

const { DYNAMODB_APP_CATEGORIES_TABLE } = process.env;
const categoryId = nanoid();

const client = new dynamoDb.DocumentClient({
  region: 'us-east-1',
});
const createAppCategory = async (params) => {
  console.log(params);
  const { name, description } = params;
  const tableParams = {
    TableName: DYNAMODB_APP_CATEGORIES_TABLE,
    Item: {
      categoryId,
      name,
      description,
      active: true,
      created: +new Date(),
      updated: +new Date(),
    },
  };

  console.log(`createAppCategory reqId: ${categoryId}, tableParams `, params);
  await client.put(tableParams).promise();
  return tableParams.Item;
};

const getAppCategory = async (categoryId) => {
  const tableParams = {
    TableName: DYNAMODB_APP_CATEGORIES_TABLE,
    Key: {
      categoryId,
    },
  };
  const { Item } = await client.get(tableParams).promise();
  return Item;
};
const updateAppCategory = async (appCategoryJSON, categoryId) => {
  let updateExpression = 'set';
  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};

  Object.keys(appCategoryJSON).forEach((item) => {
    updateExpression += ` #${item} = :${item} ,`;
    ExpressionAttributeNames[`#${item}`] = item;
    ExpressionAttributeValues[`:${item}`] = appCategoryJSON[item];
  });
  updateExpression = updateExpression.slice(0, -1);

  const params = {
    TableName: DYNAMODB_APP_CATEGORIES_TABLE,
    Key: {
      categoryId,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ConditionExpression: 'attribute_exists(categoryId)',
    ReturnValues: 'UPDATED_NEW',
  };
  const data = await client.update(params).promise();
  return data;
};
const deleteAppCategory = async (categoryId) => {
  const params = {
    TableName: DYNAMODB_APP_CATEGORIES_TABLE,
    Key: {
      categoryId,
    },
    UpdateExpression: 'set active = :active, updated = :updated',
    ConditionExpression:
      'attribute_exists(categoryId) and #categoryId = :categoryId',
    ExpressionAttributeNames: {
      '#categoryId': 'categoryId',
    },
    ExpressionAttributeValues: {
      ':categoryId': categoryId,
      ':active': false,
      ':updated': +new Date(),
    },
    ReturnValues: 'UPDATED_NEW',
  };
  const { Attributes } = await client.update(params).promise();
  return Attributes;
};

module.exports = {
  createAppCategory,
  deleteAppCategory,
  getAppCategory,
  updateAppCategory,
};
