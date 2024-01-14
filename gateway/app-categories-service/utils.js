const AWS = require('aws-sdk');
const { StatusCodes } = require('http-status-codes');
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
  verifyAccessToken,
};
