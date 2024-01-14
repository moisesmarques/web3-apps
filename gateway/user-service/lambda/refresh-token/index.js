const { StatusCodes } = require('http-status-codes');
const { nanoid } = require('nanoid');
const cloudfront = require('aws-cloudfront-sign');
const utils = require('../../utils');
const { getSecret } = require('../../src/lib/sm');
const schema = require('../../validation/user-verify-refresh-token-schema.js');

const reqId = nanoid();
const { CLOUDFRONT_SECRET_NAME, CLOUDFRONT_URL, SESSION_EXPIRATION = 24 * 60 * 60 } = process.env;

const getKeyErrorWhenParsingJson = (message, params) => {
  if (message.includes('JSON at position')) {
    const valueErrorIndex = Number(message.split('JSON at position ')[1]);
    const keys = params.substring(0, valueErrorIndex).split('"');
    return keys[keys.length - 2];
  }
  return null;
};

const getWalletInformationByID = async (walletId) => {
  console.log('getWalletInformationByID');
  const params = {
    TableName: process.env.DYNAMODB_WALLET_TABLE,
    IndexName: 'walletName-Index',
    KeyConditionExpression: 'walletName = :walletName',
    ExpressionAttributeValues: {
      ':walletName': walletId,
    },
  };
  const result = await utils.dynamoDb.query(params);
  console.log('result', result);
  return result;
};

const getUserInformationByID = async (userId) => {
  console.log('getUserInformationByID');
  const params = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    KeyConditionExpression: 'userId = :userId',
    FilterExpression: '#status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':status': 'active',
    },
  };
  const result = await utils.dynamoDb.query(params);
  return result;
};

async function cookiesHeaders(walletId) {
  console.log('CLOUDFRONT_SECRET_NAME - ', CLOUDFRONT_SECRET_NAME);
  const secret = await getSecret(CLOUDFRONT_SECRET_NAME);
  console.log('secret - ', secret);
  const { PUBLIC_KEY_ID, PRIVATE_KEY } = JSON.parse(secret);
  const sessionDuration = parseInt(SESSION_EXPIRATION, 10);
  // create signed cookies
  const signedCookies = cloudfront.getSignedCookies(`https://${CLOUDFRONT_URL}/${walletId}/*`, {
    expireTime: new Date().getTime() + sessionDuration,
    keypairId: PUBLIC_KEY_ID,
    privateKeyString: Buffer.from(PRIVATE_KEY, 'base64').toString('ascii'),
  });

  console.log('signedCookies - ', signedCookies);

  const options = `; Domain=${CLOUDFRONT_URL}; Path=/${walletId}/; Secure; HttpOnly`;
  // we use a combination of lower/upper case
  // because we need to send multiple cookies
  // but the AWS API requires all headers in a single object!
  return [
    `CloudFront-Policy=${signedCookies['CloudFront-Policy']}${options}`,
    `CloudFront-Signature=${signedCookies['CloudFront-Signature']}${options}`,
    `CloudFront-Key-Pair-Id=${signedCookies['CloudFront-Key-Pair-Id']}${options}`,
  ];
}

module.exports.handler = async (event) => {
  try {
    const isBodyJSONObj = utils.isJsonObject(event.body);
    if (!isBodyJSONObj) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        status: false,
        message: 'content should be JSON',
      });
    }

    const params = JSON.parse(event.body);
    const { error } = schema.validate(params, { abortEarly: false });

    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: error.details.map((item) => item.message).join(', '),
      });
    }
    const refreshTokenData = await utils.verifyRefreshToken(params.refreshToken);
    console.log(`reqId: ${reqId}, refreshTokenData `, refreshTokenData);
    if (refreshTokenData.walletName === params.walletName) {
      const { Items } = await getWalletInformationByID(refreshTokenData.walletName);
      const { userId } = Items[0];

      const userInfoResult = await getUserInformationByID(userId);
      console.log(`reqId: ${reqId}, login userInfoResult `, userInfoResult);

      if (!userInfoResult || userInfoResult.Count === 0) {
        return utils.send(StatusCodes.NOT_FOUND, {
          message: 'Invalid user ID or does not exist',
        });
      }
    }

    delete refreshTokenData.iat;
    delete refreshTokenData.exp;

    console.log(`reqId: ${reqId}, refreshTokenData after delete `, refreshTokenData);

    const authResponse = await utils.getAuthResponse(refreshTokenData);

    console.log(`reqId: ${reqId}, authResponse `, authResponse);

    const cookies = await cookiesHeaders(refreshTokenData.walletName);

    console.log(`reqId: ${reqId}, cookies `, cookies);
    const response = {
      jwtAccessToken: authResponse.jwtAccessToken,
      jwtRefreshToken: authResponse.jwtRefreshToken,
    };
    return utils.send(StatusCodes.CREATED, response, null, {}, cookies);
  } catch (error) {
    console.log(error);
    const { message } = error;
    const keyParsingJsonError = getKeyErrorWhenParsingJson(message, event.body);

    if (keyParsingJsonError) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        errors: [`${keyParsingJsonError} fails to match the required pattern`],
      });
    }

    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, { message });
  }
};
