const { StatusCodes } = require('http-status-codes');

const utils = require('../../utils');
const Folders = require('../../src/models/folders');
const Files = require('../../src/models/files');
const { getWallet } = require('../../src/models/wallets');
const { verifyUser } = require('../../user');
const HttpError = require('../../error');

module.exports.handler = async (event) => {
  console.log(event);
  try {
    const {
      pathParameters: { walletId, folderId },
    } = event;

    const { userId } = await verifyUser(event);

    if (!folderId) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'folderId missing in the request!',
      );
    }

    if (folderId === 'root') {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'You cannot get the details of the root folder',
      );
    }

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
    const folder = await Folders.getFolderById(folderId)
      .then(
        (res) => (res.Count ? res.Items[0] : false),
        // eslint-disable-next-line function-paren-newline
      )
      .catch(async (e) => {
        if (e.name === 'ConditionalCheckFailedException') {
          // folder not found, check as shared folder?
          // we could just have an index for the id key in the folders table
          return Folders.getSharedFolder(folderId, walletId).catch((err) => {
            if (err.name === 'ConditionalCheckFailedException') {
              throw new HttpError(
                StatusCodes.NOT_FOUND,
                `No folder '${folderId}' associated with this wallet`,
              );
            }
            throw e;
          });
        }
        throw e;
      });

    if (!folder) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `No folder '${folderId}' associated with this wallet`,
      );
    }

    folder.sharing = await Folders.getFolderShares(folderId, walletId).then(
      (shares) =>
        // eslint-disable-next-line implicit-arrow-linebreak
        shares.map((share) => ({
          walletId: share.walletId,
          permission: share.access || 'READ', // TODO: update this, is it permissions or access
        })),
    );

    folder.numberOfFilesInsd = await Files.getFilesByFolderId(
      walletId,
      folderId,
    )
      .then((files) => files.filter((f) => !!f.hash))
      .then((files) => files.length);

    folder.numberOfFolders = await Folders.getChildFoldersByFolderId(
      walletId,
      folderId,
    ).then((folders) => folders.length); // LEVEL 1

    delete folder.pk;
    delete folder.pk1;
    delete folder.sk;
    delete folder.sk1;

    return utils.send(StatusCodes.OK, {
      message: 'Folder retrieved successfully',
      data: { ...folder },
    });
  } catch (e) {
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
