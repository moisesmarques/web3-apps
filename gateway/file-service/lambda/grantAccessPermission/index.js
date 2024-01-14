/* eslint-disable linebreak-style */
const { StatusCodes } = require('http-status-codes');
const utils = require('../../utils');
const { verifyUser } = require('../../user');
const files = require('../../src/models/files');
const HttpError = require('../../error');
const wallets = require('../../src/models/wallets');

const accessTypes = ['READ', 'WRITE'];

const getBody = (event) => {
  try {
    const body = JSON.parse(event.body);
    return body;
  } catch (err) {
    throw new HttpError(StatusCodes.BAD_REQUEST, 'Invalid JSON Body');
  }
};

const validatePayload = (receiversIds) => {
  if (!Array.isArray(receiversIds)) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      'The request attribute receiversIds is missing or not an array.',
    );
  }
};

const getWallet = async (userId, walletId) => {
  const wallet = await wallets.getWallet(walletId);

  if (!wallet) {
    throw new HttpError(StatusCodes.NOT_FOUND, 'Wallet not found');
  }

  if (wallet.userId !== userId || wallet.walletId !== walletId) {
    throw new HttpError(
      StatusCodes.UNAUTHORIZED,
      'Wallet associated with user mismatch with stored wallet',
    );
  }

  return wallet;
};

const getFile = async (walletId, fileId) => {
  const file = await files.getFile(walletId, fileId);

  if (!file) {
    throw new HttpError(
      StatusCodes.NOT_FOUND,
      `No file '${fileId}' associated with this wallet`,
    );
  }

  return file;
};

const validateFileOwnerSharing = (wallet, file) => {
  if (wallet.walletId !== file.ownerId) {
    throw new HttpError(
      StatusCodes.UNAUTHORIZED,
      'Only the owner can share the file',
    );
  }
};

module.exports.handler = async (event) => {
  console.log('event is ', event);
  const {
    pathParameters: { fileId, walletId },
  } = event;

  try {
    const body = getBody(event);
    const { receiversIds, access } = body;

    validatePayload(receiversIds);

    if (!access) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'access missing in the request!',
      );
    }

    if (!accessTypes.includes(access)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Invalid access type provided',
      );
    }

    const { userId } = await verifyUser(event);

    const wallet = await getWallet(userId, walletId);

    const file = await getFile(walletId, fileId);

    validateFileOwnerSharing(wallet, file);

    const receiversWallets = await Promise.all(
      receiversIds.map((receiverId) => wallets.getWallet(receiverId)),
    );

    const sharedFiles = await Promise.all(
      receiversWallets.map(
        (receiverWallet) =>
          // eslint-disable-next-line implicit-arrow-linebreak
          files.upsertFile({
            ...file,
            access,
            ownerId: walletId,
            walletId: receiverWallet.walletId,
            userId: receiverWallet.userId,
            sharedAt: new Date().toISOString(),
          }),
        // eslint-disable-next-line function-paren-newline
      ),
    );

    return utils.send(StatusCodes.OK, sharedFiles);
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
