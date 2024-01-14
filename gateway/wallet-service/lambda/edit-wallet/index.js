const { StatusCodes } = require('http-status-codes');

const Wallets = require('../../src/models/wallets');

const HttpError = require('../../src/helpers/exception/error');

const utils = require('../../src/helpers/utils');
const { verifyUser } = require('../../src/helpers/auth/user');
const schema = require('../../src/helpers/validation/wallet-edit');

module.exports.handler = async (event) => {
  const {
    body,
    pathParameters: { walletId },
  } = event;
  try {
    if (!walletId || walletId === 'null') {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'walletId missing in the request!',
      );
    }
    const request = JSON.parse(body);

    if ('walletId' in request || 'walletID' in request) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'You are not allowed to update your NEAR wallet ID',
      );
    }

    const { error } = schema.validate(request);

    if (error) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        error.details.map((item) => item.message).join(', '),
      );
    }
    const {
      walletName,
      status,
      imageUrlPath,
      priceLimit,
      kycProvider,
      storageProvider,
    } = request;

    const { userId } = await verifyUser(event);
    const wallet = await Wallets.getWallet(walletId, userId);

    if (!wallet || wallet === null) {
      // Wallet missing. Was it deleted? Maybe
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        'Invalid wallet ID or does not exist',
      );
    }

    if (wallet.userId !== userId) {
      // Provided walletId is not owned by user
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'You are not authorized to perform this operation',
      );
    }

    const newWallet = await Wallets.upsertWallet({
      walletId,
      userId,
      walletName,
      status,
      imageUrlPath,
      priceLimit,
      kycProvider,
      storageProvider,
    });

    return utils.send(StatusCodes.ACCEPTED, {
      message: 'Wallet update successful',
    });
  } catch (e) {
    return utils.send(
      e.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: e.message,
        // data: e.data,
      },
      e,
    );
  }
};
