const AWS = require('aws-sdk');
const { StatusCodes } = require('http-status-codes');

const parameterStore = new AWS.SSM();
const jwt = require('jsonwebtoken');
const HttpError = require('./lib/error');

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

const sendEmail = async function (
  toEmailAddresses,
  fromEmailAddress,
  replyToEmailAddresses,
  subject,
  messageBody,
) {
  // Create sendEmail params
  const params = {
    Destination: {
      ToAddresses: toEmailAddresses,
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: messageBody,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: fromEmailAddress,
    ReplyToAddresses: [],
  };

  try {
    const publishEmailPromise = await new AWS.SES({ apiVersion: '2010-12-01' })
      .sendEmail(params)
      .promise();
    return publishEmailPromise.MessageId;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getParam = (param) => new Promise((res, rej) => {
  parameterStore.getParameter(
    {
      Name: param,
    },
    (err, data) => {
      if (err) {
        return rej(err);
      }
      const val = data.Parameter.Value;
      return res(val);
    },
  );
});

const verifyAccessToken = async (req) => {
  try {
    let token = req.headers.Authorization || req.headers.authorization;
    if (token) {
      token = token.replace('Bearer ', '');
      const userInfo = await jwt.verify(token, process.env.SECRET_KEY);
      userInfo.walletId = userInfo.walletId || userInfo.walletName;
      userInfo.walletName = userInfo.walletId || userInfo.walletName;
      return userInfo;
    }
    throw new HttpError(StatusCodes.UNAUTHORIZED, 'Access token is required');
  } catch (err) {
    // throw err;
    throw new HttpError(
      StatusCodes.UNAUTHORIZED,
      'invalid token',
    );
  }
};

module.exports = {
  send,
  sendEmail,
  getParam,
  verifyAccessToken,
};
