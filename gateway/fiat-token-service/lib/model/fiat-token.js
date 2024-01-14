const utils = require('../../utils');

const { DYNAMODB_FIAT_TOKENS_TABLE } = process.env;

async function createFiatToken(symbol) {
  const tableParams = {
    TableName: DYNAMODB_FIAT_TOKENS_TABLE,
    Item: {
      symbol,
      active: true,
      created: +new Date(),
      updated: +new Date(),
    },
  };

  console.log('New Token for watching fiat price created: ', symbol);

  await utils.dynamoDb.put(tableParams);

  return tableParams.Item;
}

async function getFiatPrice(symbol) {
  const params = {
    TableName: DYNAMODB_FIAT_TOKENS_TABLE,
    Key: {
      symbol,
    },
  };
  const { Item } = await utils.dynamoDb.get(params);
  return Item;
}

async function updateFiatPrice(symbol, data) {
  const params = {
    TableName: DYNAMODB_FIAT_TOKENS_TABLE,
    Key: {
      symbol,
    },
    UpdateExpression: 'set usd = :usd, eur = :eur, last_updated_at = :last_updated_at, updated = :updated',
    ConditionExpression:
      'attribute_exists(symbol) AND #symbol = :symbol',
    ExpressionAttributeValues: {
      ':usd': data.usd,
      ':eur': data.eur,
      ':symbol': symbol,
      ':last_updated_at': data.last_updated_at,
      ':updated': +new Date(),
    },
    ExpressionAttributeNames: {
      '#symbol': 'symbol',
    },
    ReturnValues: 'UPDATED_NEW',
  };
  console.log(`"${symbol}" token updated with last date: ${data.last_updated_at}, usd price: ${data.usd}`);
  const { Item } = await utils.dynamoDb.update(params);
  return Item;
}

module.exports = {
  createFiatToken,
  getFiatPrice,
  updateFiatPrice,
};
