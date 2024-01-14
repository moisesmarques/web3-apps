const { StatusCodes } = require('http-status-codes');
const utils = require('../../utils');
const { verifyUser } = require('../../user');
const Files = require('../../src/models/files');
const HttpError = require('../../error');
const { getWallet } = require('../../src/models/wallets');

module.exports.handler = async (event) => {
  // TODO: use a library that handles log sampling according to stage
  // console.log('event', JSON.stringify(event));

  const {
    pathParameters: { fileId, walletId },
    body,
  } = event;

  try {
    const { requesterId } = JSON.parse(body);
    if (requesterId == null) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'requesterId missing in the request!',
      );
    }

    const [{ userId }, ownerWallet, requesterWallet] = await Promise.all([
      verifyUser(event),
      getWallet(walletId),
      getWallet(requesterId),
    ]);

    if (!ownerWallet) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Wallet not found');
    }

    if (!requesterWallet) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Receiver wallet not found');
    }

    if (requesterWallet.userId !== userId || requesterWallet.walletId !== walletId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Wallet associated with user mismatch with stored wallet',
      );
    }

    const file = await Files.getFile(walletId, fileId);
    if (!file) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `No file '${fileId}' associated with this wallet`,
      );
    }
    const requestedFile = await Files.upsertFile({
      ...file,
      ownerId: walletId,
      walletId: requesterWallet.walletId,
      userId: requesterWallet.userId,
      requestedAt: new Date().toISOString(),
    });
    return utils.send(StatusCodes.OK, { ...requestedFile });
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
