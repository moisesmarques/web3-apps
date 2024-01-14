const { StatusCodes } = require('http-status-codes');
const utils = require('../../utils');
const { verifyUser } = require('../../user');
const Folders = require('../../src/models/folders');
const HttpError = require('../../error');
const { getWallet } = require('../../src/models/wallets');

module.exports.handler = async (event) => {
  const {
    pathParameters: { folderId, walletId },
    body,
  } = event;

  try {
    const { receiverId } = JSON.parse(body);
    if (receiverId == null) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'receiverId missing in the request!',
      );
    }

    const [{ userId }, wallet, folder] = await Promise.all([
      verifyUser(event),
      getWallet(walletId),
      Folders.getSharedFolder(folderId, receiverId),
    ]);

    if (!wallet) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Wallet not found');
    }

    if (wallet.userId !== userId || wallet.walletId !== walletId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Wallet associated with user mismatch with stored wallet',
      );
    }

    if (!folder) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        'Shared Folder does not exist',
      );
    }

    await Folders.deleteSharedFolder(folderId, walletId, receiverId);

    return utils.send(StatusCodes.ACCEPTED, {
      message: 'Folder access successfully revoked',
    });
  } catch (e) {
    if (e.name === 'ConditionalCheckFailedException') {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Item does not exist');
    }
    if (!e.status) {
      console.error(e.message, e);
    }
    return utils.send(
      e.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: e.message,
        data: e.data,
      },
      e,
    );
  }
};
