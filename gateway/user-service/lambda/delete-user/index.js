const { StatusCodes } = require('http-status-codes');
const { nanoid } = require('nanoid');
const randomGen = require('random-gen');

const utils = require('../../utils');
const schema = require('../../validation/delete-user-schema');

const reqId = nanoid();
const FROM_EMAIL_ADDRESS = 'PrimeLab <do-not-reply@nearlogin.io>';

module.exports.handler = async (event) => {
  try {
    const {
      pathParameters: { userId },
      body,
    } = event;

    if (!body) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Payload is required',
      });
    }

    const params = JSON.parse(body);

    const { error } = schema.validate(params);

    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: error.details.map((item) => item.message).join(', '),
      });
    }

    if (!userId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: "'userId' is required",
      });
    }

    const { userId: currentUserId } = await utils.verifyAccessToken(event);

    if (currentUserId !== userId) {
      return utils.send(StatusCodes.FORBIDDEN, {
        message: 'You are not allowed to perform this request',
      });
    }

    await checkPrevOTP(userId);

    // IDEA: Ian: should we remove the call below and get userInfo from token
    const userInfoResult = await getUserInformationByID(userId);
    if (!userInfoResult.Count) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: 'User not found',
      });
    }

    const userInfo = userInfoResult.Items[0];
    const otp = randomGen.number(6);

    // TODO: OTP should be sent from one function service-wide
    await createOTP(userId, otp);
    const otpMessageSubject = 'OTP from primelab';
    // TODO: There's a need to remove the below hard-coded verbiage.
    // Also, we need to have some-sort of information (e.g. appId) which can allow backend to put right app name in message.
    const otpMessage = `Your One Time Password to login to PrimeLab eco-system is ${otp}`;

    let { channelType = 'phone' } = params;

    if (!userInfo.phone) {
      channelType = 'email';
    }
    if (!userInfo.email) {
      channelType = 'phone';
    }

    if (channelType === 'email' && userInfo.email && userInfo.email.length) {
      await utils.sendEmail(
        [userInfo.email],
        FROM_EMAIL_ADDRESS,
        otpMessageSubject,
        otpMessage,
      );
    } else if (
      channelType === 'phone'
      && userInfo.phone
      && userInfo.phone.length
    ) {
      await utils.sendSMS(
        `${userInfo.countryCode}${userInfo.phone}`,
        otpMessage,
      );
    } else if (
      channelType === 'email'
      && !(userInfo.email && userInfo.email.length)
    ) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'User is registered with phone number',
      });
    } else if (
      channelType === 'phone'
      && !(userInfo.phone && userInfo.phone.length)
    ) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'User is registered with email',
      });
    }

    const response = {
      userId,
      channelType,
    };

    if (channelType === 'phone') {
      const phoneLength = userInfo.phone.length - 4;
      let maskedPhone = userInfo.phone.substring(
        userInfo.phone.length - 4,
        userInfo.phone.length,
      );

      maskedPhone = '*'.repeat(phoneLength) + maskedPhone;
      response.phone = maskedPhone;
    }
    if (channelType === 'email') {
      const [emailName, domain] = userInfo.email.split('@');

      console.log(`reqId: ${reqId}, email name and domain `, emailName, domain);

      let emailNameLength = emailName.length - 2;
      if (emailNameLength < 1) {
        emailNameLength = 1;
      }
      let maskedEmailName;
      if (emailNameLength > 0) {
        maskedEmailName = emailName.substring(0, 2) + '*'.repeat(emailNameLength);
      }
      const [provider, tld] = domain.split('.');

      let providerLength;
      let maskingLength = 3;
      if (provider.length < 3) {
        providerLength = provider.length - 1;
        maskingLength = 1;
      } else {
        providerLength = provider.length - 3;
      }

      console.log(`reqId: ${reqId}, provider `, provider);
      const maskedProviderName = provider.substring(0, providerLength) + '*'.repeat(providerLength);

      const maskedEmail = `${maskedEmailName}@${maskedProviderName}.${tld}`;
      response.email = maskedEmail;
    }
    return utils.send(StatusCodes.OK, response);
  } catch ({ message, stack }) {
    console.log(stack);
    const keyParsingJsonError = getKeyErrorWhenParsingJson(message, event.body);

    if (keyParsingJsonError) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        errors: [`${keyParsingJsonError} fails to match the required pattern`],
      });
    }
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, { message });
  }
};

const getKeyErrorWhenParsingJson = (message, params) => {
  if (message.includes('JSON at position')) {
    const valueErrorIndex = Number(message.split('JSON at position ')[1]);
    const keys = params.substring(0, valueErrorIndex).split('"');
    return keys[keys.length - 2];
  }
  return null;
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
  console.log('result', result);
  return result;
};

const createOTP = async (userId, otp) => {
  const params = {
    Item: {
      userId,
      code: otp,
      created: +new Date(),
      ttl:
        Math.floor(Date.now() / 1000)
        + parseInt(process.env.OTP_EXPIRY_IN_SECONDS),
      status: utils.OtpStatus.Active.name,
    },
    TableName: process.env.DYNAMODB_OTP_TABLE,
  };

  await utils.dynamoDb.put(params);
  return params.Item;
};

const checkPrevOTP = async (userId) => {
  console.log('checkPrevOTP - ', userId);
  const params = {
    TableName: process.env.DYNAMODB_OTP_TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };
  const getOTPResult = await utils.dynamoDb.query(params);
  console.log(`reqId: ${reqId}, login getOTPResult`, getOTPResult);
  if (getOTPResult.Count > 0) {
    await deletePrevOTP(
      userId,
      getOTPResult.Items[0].code,
      getOTPResult.Items[0].ttl,
    );
  }
};

const deletePrevOTP = async (userId, otp, ttl) => {
  const params = {
    TableName: process.env.DYNAMODB_OTP_TABLE,
    Key: {
      userId,
      ttl,
    },
    ConditionExpression: 'userId = :userId AND code = :code',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':code': otp,
    },
  };
  console.log(`reqId: ${reqId}, params `, params);
  const result = await utils.dynamoDb.delete(params);
  return result;
};
