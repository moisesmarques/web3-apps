const { StatusCodes } = require('http-status-codes');
const { nanoid } = require('nanoid');
const utils = require('../../utils');
const Users = require('../../src/models/users');
const Wallets = require('../../src/models/wallets');
const reqId = nanoid();

module.exports.handler = async (event) => {
  const {
    pathParameters: { userId },
  } = event;
  try {
    if (!userId || userId === 'null') {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'userId missing in the request',
      });
    }

    const tokenResponse = await utils.verifyAccessToken(event);
    console.log(`reqId: ${reqId}, tokenResponse`, tokenResponse);
    const user = await Users.getUser(userId);
    console.log(`reqId: ${reqId}, user`, user);
    
    if (!user) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: `Invalid user ID or does not exist`,
      });
    }

    if (user.userId != tokenResponse.userId) {
      return utils.send(StatusCodes.UNAUTHORIZED, {
        message: `User is not authorized to perform this action`,
      });
    }

    user.walletName = tokenResponse.walletName;
    
    const wallets = await Wallets.getWalletsByUserID(
      userId,
      event.headers?.Authorization || event.headers?.authorization,
    );

    user.wallets = wallets;

    const authResponse = await utils.getAuthResponse(user);

    return utils.send(StatusCodes.OK, authResponse);
  } catch (e) {
    console.log(e);
    return utils.send(
      e.expiredAt
        ? StatusCodes.UNAUTHORIZED
        : e.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: e.message,
        data: e.data || e.expiredAt || e.date,
      },
      e,
    );
  }
};
