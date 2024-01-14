const { StatusCodes } = require('http-status-codes');
const { nanoid } = require('nanoid');
// const randomGen = require('random-gen');
const cloudfront = require('aws-cloudfront-sign');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const utils = require('../../utils');
const userSchema = require('../../validation/user-authentication-confirm-schema');
const { getSecret } = require('../../src/lib/sm');

const { CLOUDFRONT_SECRET_NAME, CLOUDFRONT_URL, SESSION_EXPIRATION = 24 * 60 * 60 } = process.env;

const client = new DynamoDB.DocumentClient();

const reqId = nanoid();

module.exports.handler = async (event) => {
  try {
    const params = JSON.parse(event.body);
    let appId;
    const { error } = userSchema.user_auth.validate(params, {
      abortEarly: false,
    });

    if (error) {
      if (error) {
        return utils.send(StatusCodes.BAD_REQUEST, {
          errors: error.details.map((item) => item.message),
        });
      }
    }

    if (event.headers['x-near-appId']) {
      const { app_error } = userSchema.app_schema.validate(
        { appId: event.headers['x-near-appId'] },
        {
          abortEarly: false,
        },
      );

      if (!app_error) {
        const { Item } = await client
          .get({
            TableName: 'near-apps',
            Key: {
              appId: event.headers['x-near-appId'],
            },
          })
          .promise();
        appId = Item ? Item.appId : null;
        console.log(`reqId: ${reqId}, appId `, appId);
        if (!appId) {
          return utils.send(StatusCodes.NOT_FOUND, {
            message: 'App ID not found',
          });
        }
      }
    }

    if (!(await utils.checkWalletNameExists(params.walletID))) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: 'Account ID not found',
      });
    }

    const walletInfoResult = await getWalletInformationByID(params.walletID);
    const walletInfo = walletInfoResult.Items[0];
    const { userId, walletId } = walletInfo;
    const verifyOTPResult = await verifyOTP(userId, params.OTP);
    console.log(`reqId: ${reqId}, verifyOTPResult `, verifyOTPResult);

    if (verifyOTPResult.length == 0) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: 'Invalid Account ID/OTP ',
      });
    }
    if (verifyOTPResult[0].status == utils.OtpStatus.Expired.name) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: 'OTP is expired',
      });
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const createdTime = Math.floor(verifyOTPResult[0].created / 1000);
    const timeDifference = currentTime - createdTime;

    console.log(`reqId: ${reqId}, currentTime `, currentTime);
    console.log(`reqId: ${reqId}, currentTime `, createdTime);
    console.log(`reqId: ${reqId}, timeDifference `, timeDifference);
    if (timeDifference > parseInt(process.env.OTP_EXPIRY_IN_SECONDS)) {
      const expireOTPResult = await expireOTP(
        userId,
        params.OTP,
        verifyOTPResult[0].ttl,
      );
      console.log(`reqId: ${reqId}, expireOTPResult `, expireOTPResult);
      return utils.send(StatusCodes.NOT_FOUND, {
        message: 'OTP is expired',
      });
    }

    await expireOTP(
      userId,
      params.OTP,
      verifyOTPResult[0].ttl,
    );

    const userInfoResult = await getUserInformationByID(userId);

    const userInfo = userInfoResult.Items[0];
    console.log(`reqId: ${reqId}, userInfo `, userInfo);
    userInfo.walletName = params.walletID;
    userInfo.appId = appId;
    const authResponse = await utils.getAuthResponse(userInfo);
    const cookies = await cookiesHeaders(params.walletID);
    const response = {
      jwtAccessToken: authResponse.jwtAccessToken,
      jwtRefreshToken: authResponse.jwtRefreshToken,
      user: { ...userInfo },
    };
    return utils.send(StatusCodes.CREATED, response, null, {}, cookies);
  } catch (err) {
    console.log(`reqId: ${reqId}, verify err`, err);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: `${err.message}`,
    });
  }
};

const updateVerifiedStatus = async (userId, channelType) => {
  let UpdateExpression;
  let ExpressionAttributeValues = {};
  if (channelType == 'email') {
    ExpressionAttributeValues = {
      ':isEmailVerified': true,
    };
  } else {
    UpdateExpression = 'set #isPhoneVerified = :flag';
    ExpressionAttributeValues = {
      ':isPhoneVerified': true,
    };
  }
  const params = {
    TableName: process.env.DYNAMODB_USER_TABLE,
    Key: {
      userId,
    },
    UpdateExpression,
    ConditionExpression: 'userId = :userId',
    ExpressionAttributeValues,
    ReturnValues: 'UPDATED_NEW',
  };
};

const expireOTP = async (userId, otp, ttl) => {
  const params = {
    TableName: process.env.DYNAMODB_OTP_TABLE,
    Key: {
      userId,
      ttl,
    },
    UpdateExpression: 'set #status = :status',
    ConditionExpression: 'userId = :userId AND code = :code',
    ExpressionAttributeValues: {
      ':status': utils.OtpStatus.Expired.name,
      ':userId': userId,
      ':code': otp,
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ReturnValues: 'UPDATED_NEW',
  };
  console.log(`reqId: ${reqId}, params `, params);
  const result = await utils.dynamoDb.update(params);
  return result;
};

const getWalletInformationByID = async (walletId) => {
  const params = {
    TableName: process.env.DYNAMODB_WALLET_TABLE,
    IndexName: 'walletName-Index',
    KeyConditionExpression: 'walletName = :walletName',
    ExpressionAttributeValues: {
      ':walletName': walletId,
    },
  };
  const result = await utils.dynamoDb.query(params);
  return result;
};
const getUserInformationByID = async (userId) => {
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

const verifyOTP = async (userId, otp) => {
  const params = {
    TableName: process.env.DYNAMODB_OTP_TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };
  const result = await utils.dynamoDb.query(params);
  return result.Items.filter((item) => item.code === otp);
};

async function cookiesHeaders(walletId) {
  const secret = await getSecret(CLOUDFRONT_SECRET_NAME);
  const { PUBLIC_KEY_ID, PRIVATE_KEY } = JSON.parse(secret);
  const sessionDuration = parseInt(SESSION_EXPIRATION, 10);
  // create signed cookies
  const signedCookies = cloudfront.getSignedCookies(`https://${CLOUDFRONT_URL}/${walletId}/*`, {
    expireTime: new Date().getTime() + sessionDuration,
    keypairId: PUBLIC_KEY_ID,
    privateKeyString: Buffer.from(PRIVATE_KEY, 'base64').toString('ascii'),
  });
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
