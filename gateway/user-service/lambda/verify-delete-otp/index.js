const { StatusCodes } = require('http-status-codes');

const utils = require('../../utils');
const schema = require('../../validation/verify-delete-otp-schema');
const Users = require('../../src/models/users');

module.exports.handler = async (event) => {
  try {
    const { body } = event;

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

    const { otp } = params;

    const { userId } = await utils.verifyAccessToken(event);

    const verifyOTPResult = await getOTP(userId, otp);
    if (!verifyOTPResult.length) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: 'OTP not found or already used.',
      });
    }
    await deletePrevOTP(
      userId,
      verifyOTPResult[0].code,
      verifyOTPResult[0].ttl,
    );
    const user = await Users.upsertUser({
      userId,
      status: utils.UserStatus.Deleted.name,
    });

    return utils.send(StatusCodes.ACCEPTED, { ...user, verifyOTPResult });
  } catch (err) {
    console.log(err);
    return utils.send(err.status || StatusCodes.INTERNAL_SERVER_ERROR, {
      message: err.message,
    });
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
  const result = await utils.dynamoDb.delete(params);
  return result;
};

const getOTP = async (userId, otp) => {
  const params = {
    TableName: process.env.DYNAMODB_OTP_TABLE,
    FilterExpression: 'userId = :userId AND code = :code',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':code': otp,
    },
  };
  const result = await utils.dynamoDb.scan(params);
  return result;
};
