const { StatusCodes } = require('http-status-codes');
const S3 = require('aws-sdk/clients/s3');
const utils = require('../../utils');
const { verifyUser } = require('../../user');
const Files = require('../../src/models/files');
const HttpError = require('../../error');
const { getWallet } = require('../../src/models/wallets');
const Version = require('../../src/lib/versioning');

const s3 = new S3();

const { BUCKET_NAME_FILES } = process.env;

module.exports.handler = async (event) => {
  // TODO: use a library that handles log sampling according to stage
  // console.log('event', JSON.stringify(event));

  const {
    pathParameters: { fileId, walletId },
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

    const [{ userId }, wallet, newOwnerWallet] = await Promise.all([
      verifyUser(event),
      getWallet(walletId),
      getWallet(receiverId),
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

    if (!newOwnerWallet) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Receiver wallet not found');
    }

    const file = await Files.getFile(walletId, fileId);
    if (!file) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `No file '${fileId}' associated with this wallet`,
      );
    }

    const folderId = file.folderId || 'root';

    let Key; // New Owner
    let CopySource; // Old Owner
    switch (file.version) {
      case Version.v1:
        Key = `${newOwnerWallet.ownerId}/root/${file.fileId}`;
        CopySource = `${BUCKET_NAME_FILES}/${file.ownerId}/${folderId}/${file.fileId}`;
        break;

      default:
        Key = `${newOwnerWallet.ownerId}/root/${file.fileId}_${file.name}`;
        CopySource = `${BUCKET_NAME_FILES}/${file.ownerId}/${folderId}/${file.fileId}_${file.name}`;
        break;
    }

    // copy file
    await s3
      .copyObject({
        Bucket: BUCKET_NAME_FILES,
        CopySource,
        Key,
      })
      .promise();

    // delete original file
    await s3
      .deleteObject({
        Bucket: BUCKET_NAME_FILES,
        Key: CopySource,
      })
      .promise();

    // update previous file
    const { sharedAt, acceptedAt, ...data } = file;

    await Promise.all([Files.deleteFileFromAllWallets(file.hash)]);

    const newFile = {
      ...file,
      walletId: newOwnerWallet.walletId,
      ownerId: walletId,
      userId: newOwnerWallet.userId,
    };
    await Files.upsertFile(newFile);
    return utils.send(StatusCodes.OK, { ...newFile });
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
