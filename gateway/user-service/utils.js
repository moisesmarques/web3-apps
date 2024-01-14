'use strict';
const SNS = require('aws-sdk/clients/sns');
const SES = require('aws-sdk/clients/ses');
const SSM = require('aws-sdk/clients/ssm');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const jwt = require('jsonwebtoken');
const { DateTime } = require('luxon');
const { nanoid } = require('nanoid');
const axios = require('axios');
const sgMail = require('@sendgrid/mail');
const {
  APIClient,
  SendEmailRequest,
  RegionUS,
  RegionEU,
} = require('customerio-node');

const reqId = nanoid();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const customerIoApi = new APIClient(process.env.CUSTOMER_IO_API_KEY, {
  region: RegionUS,
});

const getParam = (param) => {
  return new Promise(async (res, rej) => {
    try {
      const data = await parameterStore.getParameter({ Name: param }).promise();
      return res(data);
    } catch (err) {
      return rej(err);
    }
  });
};

const TOKEN_EXPIRY_IN_MILLISECONDS = process.env.TOKEN_EXPIRY_IN_MILLISECONDS;
const REFRESH_TOKEN_EXPIRY_IN_MILLISECONDS =
  process.env.REFRESH_TOKEN_EXPIRY_IN_MILLISECONDS;
const parameterStore = new SSM();
const client = new DynamoDB.DocumentClient();
let SECRET_KEY;
let REFRESH_SECRET_KEY;

const getAuthResponse = async (user) => {
  if (!SECRET_KEY) {
    const secretKeyParameterStore = await getParam('SECRET_KEY');
    SECRET_KEY = secretKeyParameterStore.Parameter.Value;
  }

  if (!REFRESH_SECRET_KEY) {
    const refreshSecretKeyParameterStore = await getParam('REFRESH_SECRET_KEY');
    REFRESH_SECRET_KEY = refreshSecretKeyParameterStore.Parameter.Value;
  }

  const accessToken = await jwt.sign(user, SECRET_KEY, {
    expiresIn: TOKEN_EXPIRY_IN_MILLISECONDS,
  });

  const refreshToken = await jwt.sign(user, REFRESH_SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRY_IN_MILLISECONDS,
  });

  return {
    jwtAccessToken: accessToken,
    jwtRefreshToken: refreshToken,
    user: user,
  };
};

const verifyAccessToken = async (event) => {
  try {
    const token = event.headers.Authorization || event.headers.authorization;

    if (!token) {
      throw { status: 401, message: 'You are not authenticated' };
    }

    if (!SECRET_KEY) {
      const secretKeyParameterStore = await getParam('SECRET_KEY');
      SECRET_KEY = secretKeyParameterStore.Parameter.Value;
    }

    if (!SECRET_KEY) {
      throw new Error('SECRET_KEY parameter has not been set');
    }

    const decoded = await jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
    return decoded;
  } catch (e) {
    throw e;
  }
};

const verifyRefreshToken = async (refreshToken) => {
  try {
    if (!REFRESH_SECRET_KEY) {
      const refreshSecretKeyParameterStore = await getParam('REFRESH_SECRET_KEY');
      REFRESH_SECRET_KEY = refreshSecretKeyParameterStore.Parameter.Value;
    }

    const decoded = await jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    console.log('decoded - ', decoded);
    //req.decoded = decoded;
    return decoded;
  } catch (e) {
    throw e;
  }
};

const dynamoDb = {
  get: (params) => client.get(params).promise(),
  scan: async (params) => {
    let resultArr = [];
    await client.scan(params, onScan).promise();
    return resultArr;

    function onScan(err, data) {
      if (err) {
        console.error(
          'Unable to scan the table. Error JSON:',
          JSON.stringify(err, null, 2),
        );
      } else {
        data.Items.forEach(function (itemdata) {
          resultArr.push(itemdata);
        });
        // continue scanning if we have more items
        if (typeof data.LastEvaluatedKey != 'undefined') {
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

const send = (
  statusCode,
  data,
  err = null,
  extraHeaders = {},
  cookies = [],
) => {
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    ...extraHeaders,
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
    statusCode: statusCode,
    headers: responseHeaders,
    cookies,
    body: JSON.stringify(data),
  };
};

const checkEmailExists = async (email) => {
  const params = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':email': email,
      ':status': 'active',
    },
  };
  const result = await dynamoDb.query(params);
  console.log(`reqId: ${reqId}, result emailCheck `, result);
  return result.Count > 0;
};

const checkPhoneExists = async (phone) => {
  const params = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    IndexName: 'PhoneIndex',
    KeyConditionExpression: 'phone = :phone',
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':phone': phone,
      ':status': 'active',
    },
  };
  const result = await dynamoDb.query(params);
  console.log(`reqId: ${reqId}, result phoneCheck `, result);
  return result.Count > 0;
};

const checkWalletNameExists = async (walletName) => {
  const params = {
    TableName: process.env.DYNAMODB_WALLET_TABLE,
    IndexName: 'walletName-Index',
    KeyConditionExpression: 'walletName = :walletName',
    ExpressionAttributeValues: {
      ':walletName': walletName,
    },
  };
  const result = await dynamoDb.query(params);
  const dbWalletCheck = result.Count > 0;

  let indexerCheck = true;
  try {
    const config = {
      headers: {
        jwt_token: `${process.env.INDEXER_STATIC_JWT_TOKEN}`,
      },
    };
    const indexerWalletCheckURL = `${process.env.INDEXER_API_URL}/wallets/${walletName}`;
    console.log(
      `reqId: ${reqId}, indexerWalletCheckURL`,
      indexerWalletCheckURL,
    );
    const indexerWalletCheckResponse = await axios.get(
      indexerWalletCheckURL,
      config,
    );
    console.log(
      `reqId: ${reqId}, indexerWalletCheckResponse `,
      indexerWalletCheckResponse,
    );
  } catch (err) {
    console.log(
      `Silent fail indexer check wallet name: ${walletName}`,
      err.response.status,
    );
    console.log(
      `Silent fail indexer check wallet name: ${walletName}`,
      err.response.message,
    );
    indexerCheck = err.response.status == 400 ? false : true;
  }

  console.log('dbWalletCheck - ', dbWalletCheck);
  console.log('indexerCheck - ', indexerCheck);

  // TODO: this is a hotfix made by @adnene we need to figure out why we are getting 409 in
  //  production only when we create a user
  // return dbWalletCheck || indexerCheck;
  return dbWalletCheck;
};

//Get difference in years for given date vs current date
const getDateDifference = (inputDate, inputFormat, unit) => {
  inputDate = DateTime.fromFormat(inputDate, inputFormat);
  const currentDate = DateTime.now();
  const difference = currentDate.diff(inputDate, unit)[unit];
  return difference;
};

const sendSMS = async function (toNumber, message) {
  var params = {
    Message: message,
    PhoneNumber: toNumber,
  };

  try {
    var publishTextPromise = await new SNS({ apiVersion: '2010-03-31' })
      .publish(params)
      .promise();
    return publishTextPromise.MessageId;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

async function sendEmail(
  toEmailAddresses,
  fromEmailAddress,
  subject,
  messageBody,
  html,
) {
  const msg = {
    to: toEmailAddresses,
    from: fromEmailAddress,
    subject: subject,
    text: messageBody,
    html,
  };
  try {
    //const response = await sgMail.send(msg);

    const request = new SendEmailRequest({
      identifiers: {
        email: toEmailAddresses,
      },
      to: toEmailAddresses,
      from: fromEmailAddress,
      subject: subject,
      body: messageBody,
    });

    console.log(`reqId: ${reqId}, sendEmail request`, request);

    const response = await customerIoApi.sendEmail(request);

    console.log(`reqId: ${reqId}, sendEmail response`, response);

    return response;
  } catch (e) {
    console.error('error sending Sendgrid mail', e);
    throw e;
  }
}
// const sendEmail = async function (
//   toEmailAddresses,
//   fromEmailAddress,
//   subject,
//   messageBody,
// ) {
//   // Create sendEmail params
//   var params = {
//     Destination: {
//       ToAddresses: toEmailAddresses,
//     },
//     Message: {
//       Body: {
//         Html: {
//           Charset: 'UTF-8',
//           Data: messageBody,
//         },
//       },
//       Subject: {
//         Charset: 'UTF-8',
//         Data: subject,
//       },
//     },
//     Source: fromEmailAddress,
//     ReplyToAddresses: [],
//   };
//
//   try {
//     var publishEmailPromise = await new SES({ apiVersion: '2010-12-01' })
//       .sendEmail(params)
//       .promise();
//     return publishEmailPromise.MessageId;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

//NOTE: USER STATUS
class UserStatus {
  static Active = new UserStatus('active');
  static Blocked = new UserStatus('blocked');
  static Deleted = new UserStatus('deleted');

  constructor(name) {
    this.name = name;
  }
}

class OtpStatus {
  static Active = new UserStatus('active');
  static Expired = new UserStatus('expired');
  constructor(name) {
    this.name = name;
  }
}

function isJsonObject(data) {
  try {
    JSON.parse(data);
  } catch (e) {
    return false;
  }
  return true;
}

module.exports = {
  getParam,
  isJsonObject,
  verifyRefreshToken,
  getAuthResponse,
  verifyAccessToken,
  client,
  UserStatus,
  OtpStatus,
  dynamoDb,
  send,
  getDateDifference,
  sendSMS,
  sendEmail,
  checkEmailExists,
  checkPhoneExists,
  checkWalletNameExists,
};
