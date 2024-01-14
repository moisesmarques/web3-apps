const { StatusCodes } = require('http-status-codes');
const { nanoid } = require('nanoid');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const utils = require('../../utils');
const schema = require('../../validation/user-schema.js');
const Wallets = require('../../src/models/wallets');
// const secretkey = require("../../../serverless-config.json");
const Users = require('../../src/models/users');

const reqId = nanoid();
module.exports.handler = async (event) => {
  try {
    const params = JSON.parse(event.body);
    if (typeof params.token === 'undefined' || params.token == null) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Token is required',
      });
    }

    const token = await decrypt(params);
    console.log(token, 'token===================');
    const verifytoken = {
      headers: {
        Authorization: token,
      },
    };
    const userdetails = await utils.verifyAccessToken(verifytoken);
    console.log(userdetails, 'userdetails----------------');
    if (typeof (userdetails) === 'undefined' || userdetails == null) {
      return utils.send(StatusCodes.FORBIDDEN, {
        message: 'You are not allowed to perform this request',
      });
    }
    const { userId } = userdetails;
    const isEmailVerified = true;
    const user = await Users.upsertUser({
      userId,
      isEmailVerified,
    });

    return utils.send(StatusCodes.ACCEPTED, { message: 'Email Verified Successfully' });
  } catch (err) {
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: `${err.message}`,
    });
  }
};

const decrypt = async (request) => {
// Decrypt
  const bytes = CryptoJS.AES.decrypt(request.token, process.env.SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
