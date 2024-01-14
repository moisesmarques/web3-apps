/* eslint-disable semi */
/* eslint-disable no-empty */
// eslint-disable-next-line import/no-extraneous-dependencies
const BPromise = require('bluebird');
const { StatusCodes } = require('http-status-codes');
const utils = require('../../utils');
const Folders = require('../../src/models/folders');
const { verifyUser } = require('../../user');
const { getWallet } = require('../../src/models/wallets');
const HttpError = require('../../error');

module.exports.handler = async (event) => {
  try {
    const {
      body: eventBody,
      pathParameters: { walletId, folderId },
    } = event;
    let body;
    try {
      body = JSON.parse(eventBody);
    } catch (err) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Invalid JSON Body',
        data: {},
      });
    }

    const { receiverIds } = body;
    if (!receiverIds) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'receiverIds missing in the request!',
      );
    }

    if (!Array.isArray(receiverIds)) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: '"receiverIds" should be a valid array',
      });
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

    // const receiverWalletPromise = receiverIds.map((item) => getWallet(item));
    // const wallets = await BPromise.map(receiverIds, getWallet, {concurrency: 10});
    // const receiverWallet = await Promise.all(receiverWalletPromise);
    const receiverWallets = await BPromise.map(receiverIds, getWallet, {
      concurrency: 10,
    });

    if (!receiverWallets.length) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Receiver wallet not found');
    }

    const folder = await Folders.getFolderById(folderId);
    if (!folder.Items.length) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `No folder '${folderId}' associated with this wallet`,
      );
    }

    if (![folder.Items[0]?.ownerId].includes(walletId)) {
      // Wallet requesting the folder is not the owner
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'You are not authorized to perform this operation',
      );
    }

    // We will not update individual files under folder
    // We will only update the folders under the shared folder
    // All files under a share folder will be accessible by the user(read only)
    // Create a sharedFolder for all the provided wallets
    // Crate a dynamodb stream to cascade the share feature on child folders

    const sharedFolderPromise = receiverWallets.map((item) =>
      Folders.upsertFolder({
        ...(folder.Items[0] || {}),
        pk: `SHARED_FOLDER#ownerWalletId=${walletId}#id=${folderId}`,
        sk: `walletId=${item.walletId}`,
        ownerId: walletId,
        walletId: item.walletId,
        created: +new Date(),
        sharedAt: new Date().toISOString(),
        pk1: `SHARED_FOLDER#receiverWalletId=${item.walletId}`,
        sk1: `id=${folderId}`,
      }),
    );
    await Promise.all(sharedFolderPromise);

    return {
      message: 'Folder shared successfully',
    };
  } catch (e) {
    console.log(e);
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
