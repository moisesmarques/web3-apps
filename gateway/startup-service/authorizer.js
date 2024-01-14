const jwt = require('jsonwebtoken');

const { SECRET_KEY } = process.env;

exports.handler = async (event, context) => {
  console.log('event', JSON.stringify(event));

  const token = event.authorizationToken || event.headers.authorization || event.headers.Authorization;

  if (!token) {
    return { isAuthorized: false };
  }

  try {
    await jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
    return { isAuthorized: true };
  } catch (e) {
    return { isAuthorized: false };
  }
};
