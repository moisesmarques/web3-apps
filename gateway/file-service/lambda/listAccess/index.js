const { StatusCodes } = require('http-status-codes');

const utils = require('../../utils');
const Files = require('../../src/models/files');
const { verifyUser } = require('../../user');
const { getWallet } = require('../../src/models/wallets');
const HttpError = require('../../error');

module.exports.handler = async (event) => {
  // TODO: use a library that handles log sampling according to stage
  // console.log('event', JSON.stringify(event));
  try {
    const {
      pathParameters: { walletId, fileId },
    } = event;
    if (!walletId) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'walletId is required ');
    }
    if (!fileId) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'fileId is required');
    }

    const { userId } = await verifyUser(event);
    const wallet = await getWallet(walletId);

    if (!wallet) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Wallet not found');
    }
    if (wallet.userId !== userId || wallet.walletId !== walletId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Wallet associated with user mismatch with stored wallet',
      );
    }

    const files = await Files.getFilesByFileId(walletId, fileId);

    if (!files) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `File ${fileId} not found`,
      );
    }

    const filesShared = files
      .filter((file) => file.userId !== userId)
      .map((file) => ({
        walletId: file.walletId,
        sharedAt: file.sharedAt,
        access: file.access ? file.access : 'READ',
      }));

    // Does ownerId reference the actual file owner ???
    // Replace file.walletId with the correct file owner key
    return utils.send(
      StatusCodes.OK,
      filesShared,
    );
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
