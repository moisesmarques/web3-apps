// TODO: use user-service/utils instead. wait for decoded jwt to be returned by fuction verifyUser
// TODO: remove jsonwebtoken package from file-service
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const HttpError = require('./error');

const SECRET_KEY = 'MyAwesomeKey';
const verifyUser = async (req) => {
  const token = req.headers.Authorization || req.headers.authorization;
  if (!token) {
    throw new HttpError(StatusCodes.UNAUTHORIZED, 'You are not authenticated');
  }
  try {
    return jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
  } catch (error) {
    console.info('error verifying jwt token', error);
    throw error;
  }
};

module.exports = {
  verifyUser,
};
