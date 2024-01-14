const { StatusCodes } = require('http-status-codes');
const utils = require('../../utils');
const HttpError = require('../../error');
const Folders = require('../../src/models/folders');

//  value
const { verifyUser } = require('../../user');
const { getWallet } = require('../../src/models/wallets');

module.exports.handler = async (event) => {
  const {
    pathParameters: { folderId, walletId },
    queryStringParameters: { parentFolderId },
  } = event;

  try {
    if (!folderId || folderId === 'null') {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'folderId missing in the request!',
      );
    } else if (!parentFolderId || parentFolderId === 'null') {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'parentFolderId missing in the request!',
      );
    }

    const [{ userId }, wallet] = await Promise.all([
      verifyUser(event),
      getWallet(walletId),
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
    const folder = await Folders.getFolderById(walletId, folderId);
    if (!folder) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `No folder '${folderId}' associated with this wallet`,
      );
    }

    if (![folder.Item.walletId, folder.Item.ownerId].includes(walletId)) {
      // Wallet requesting the folder is not the owner nor a friend of the owner
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'You are not authorized to perform this operation',
      );
    }

    // TODO: handle move folder
    const moveFolder = await Folders.upsertFolder({
      ...folder.Item,
      ...(['root', undefined, null].includes(parentFolderId) ? { pk1: `FOLDER#walletId=${walletId}`, parentFolderId: null } : { pk1: `FOLDER#walletId=${walletId}#parentFolderId=${folderId}`, parentFolderId }),
    });

    return utils.send(StatusCodes.OK, { ...moveFolder });
  } catch (e) {
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
