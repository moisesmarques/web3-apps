const _ = require('underscore');
const AWS = require('aws-sdk');
const xray = require('aws-xray-sdk');
const jwt = require('jsonwebtoken');

const { IS_OFFLINE, IS_LOCAL, SECRET_KEY } = process.env;
const awsWrapped = IS_LOCAL ? AWS : xray.captureAWS(AWS);
const client = IS_OFFLINE
  ? new awsWrapped.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  })
  : new awsWrapped.DynamoDB.DocumentClient();

const dynamoDb = {
  get: (params) => client.get(params).promise(),
  scan: async (params) => {
    const resultArr = [];
    await client.scan(params, onScan).promise();
    return resultArr;

    function onScan(err, data) {
      if (err) {
        console.error(
          'Unable to scan the table. Error JSON:',
          JSON.stringify(err, null, 2),
        );
      } else {
        data.Items.forEach((itemdata) => {
          resultArr.push(itemdata);
        });
        // continue scanning if we have more items
        if (typeof data.LastEvaluatedKey !== 'undefined') {
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          client.scan(params, onScan);
        }
      }
    }
  },
  batchGet: (params) => client.batchGet(params).promise(),
  batchWrite: (params) => client.batchWrite(params).promise(),
  query: (params) => client.query(params).promise(),
  put: (params) => client.put(params).promise(),
  update: (params) => client.update(params).promise(),
  delete: (params) => client.delete(params).promise(),
  transactWriteItems: (params) => client.transactWrite(params).promise(),
};

const constructUpdateExpressions = (inputParams) => {
  // Function to generate update expression for DynamoDB automatically based on the inputParams
  let updateExpression = '';
  const finalExpression = {};
  const expAttrNames = {};
  const expAttValues = {};
  const systemValReplacements = {
    status: 'x_status',
  };
  for (const attr in inputParams) {
    const emptyExpAttrNames = false;
    const replacedAttrVal = attr && systemValReplacements[attr] ? systemValReplacements[attr] : '';
    if (replacedAttrVal && !updateExpression) {
      updateExpression += `set #${replacedAttrVal} = :new_${attr}`;
    } else if (replacedAttrVal) {
      updateExpression += `, #${replacedAttrVal} = :new_${attr}`;
    }
    if (!replacedAttrVal && attr && !updateExpression) {
      updateExpression += `set ${attr} = :new_${attr}`;
    } else if (!replacedAttrVal && attr) {
      updateExpression += `, ${attr} = :new_${attr}`;
    }
    if (attr) {
      expAttValues[`:new_${attr}`] = inputParams[attr];
    }
    if (replacedAttrVal) {
      expAttrNames[`#${replacedAttrVal}`] = attr;
    }
  }
  if (!_.isEmpty(updateExpression)) {
    finalExpression.UpdateExpression = updateExpression;
  }
  if (!_.isEmpty(expAttrNames)) {
    finalExpression.ExpressionAttributeNames = expAttrNames;
  }
  if (!_.isEmpty(expAttValues)) {
    finalExpression.ExpressionAttributeValues = expAttValues;
  }
  return finalExpression;
};

const send = (statusCode, data, err = null) => {
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };

  if (err) {
    if (err.name === 'TokenExpiredError') {
      const { message } = err;
      return {
        statusCode: 401,
        headers: responseHeaders,
        body: JSON.stringify({
          message,
        }),
      };
    }
  }

  return {
    statusCode,
    headers: responseHeaders,
    body: JSON.stringify(data),
  };
};

const verifyAccessToken = async (req) => {
  try {
    const token = req.headers.Authorization;
    if (!token) {
      throw new Error('Access Token is required.');
    }
    return jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  send,
  constructUpdateExpressions,
  verifyAccessToken,
  dynamoDb,
};
