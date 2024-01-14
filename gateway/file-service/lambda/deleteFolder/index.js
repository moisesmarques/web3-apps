/* eslint-disable no-await-in-loop */
/* eslint-disable semi */
/* eslint-disable no-empty */
// eslint-disable-next-line import/no-extraneous-dependencies

const { StatusCodes } = require('http-status-codes');
const utils = require('../../utils');
const Folders = require('../../src/models/folders')
const { verifyUser } = require('../../user');
const Wallets = require('../../src/models/wallets');
const HttpError = require('../../error');

module.exports.handler = async (event) => {
  console.log(JSON.stringify(event));
  try {
    const {
      pathParameters: { walletId, folderId },
    } = event;
    await verifyUser(event);
    if (!folderId || folderId === 'null') {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'folderId missing in the request!',
      );
    }
    const wallet = await Wallets.getWallet(walletId);

    if (!wallet) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Wallet not found');
    }
    if (wallet.walletId !== walletId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Wallet associated with user mismatch with stored wallet',
      );
    }
    const folderData = await Folders.getFolderById(folderId);

    console.log('folderData', folderData);

    if (!folderData.Count) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `No folder '${folderId}' associated with this wallet`,
      );
    }
    console.log(walletId);
    console.log(folderId);
    await Folders.deleteFolder(walletId, folderId);
    return utils.send(StatusCodes.ACCEPTED);
  } catch (e) {
    console.error(e);
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
