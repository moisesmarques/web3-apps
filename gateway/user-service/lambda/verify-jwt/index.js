const { StatusCodes } = require('http-status-codes');

const utils = require('../../utils');

module.exports.handler = async (event) => {
  try {
    if (!event.body) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'body missing in the request',
      });
    }

    const { token } = JSON.parse(event.body);

    if (!token || token === 'null') {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'token missing in the request',
      });
    }

    const tokenResponse = await utils.verifyAccessToken(event);

    return utils.send(StatusCodes.OK, {
      authenticated: true,
      data: tokenResponse,
    });
  } catch (e) {
    console.log(e);
    return utils.send(
      e.status || StatusCodes.UNAUTHORIZED,
      {
        authenticated: false,
        message: e.message,
        data: e.data || e.expiredAt || e.date,
      },
      e,
    );
  }
};
