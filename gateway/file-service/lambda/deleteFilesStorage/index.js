const S3 = require('aws-sdk/clients/s3');
const { StatusCodes } = require('http-status-codes');
const utils = require('../../utils');
const { verifyUser } = require('../../user');
const Files = require('../../src/models/files');
const HttpError = require('../../error');
const { getWallet } = require('../../src/models/wallets');
const Version = require('../../src/lib/versioning');

const s3 = new S3();

const { BUCKET_NAME_FILES } = process.env;

module.exports.handler = async (event) => {
  const {
    pathParameters: { walletId },
  } = event;
  const { fileIds } = JSON.parse(event.body);

  try {
    if (!Array.isArray(fileIds)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Array of fileId missing in the request!',
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

    await Promise.all(
      fileIds.map(async (fileId) => {
        const file = await Files.getFile(walletId, fileId);
        if (!file) {
          throw new HttpError(
            StatusCodes.NOT_FOUND,
            `No file '${fileId}' associated with wallet '${walletId}'`,
          );
        }

        if (!file.hash) {
          throw new HttpError(
            StatusCodes.NOT_FOUND,
            `No file '${fileId}' associated with wallet '${walletId}' has been uploaded`,
          );
        }

        if (![file.walletId, file.ownerId].includes(walletId)) {
          // Wallet requesting the file is not the owner nor a friend of the owner
          throw new HttpError(
            StatusCodes.UNAUTHORIZED,
            'You are not authorized to perform this operation',
          );
        }
        const folderId = file.folderId || 'root';
        let Key;
        switch (file.version) {
          case Version.v1:
            Key = `${file.ownerId}/${folderId}/${file.fileId}`;
            break;

          default:
            Key = `${file.ownerId}/${folderId}/${file.fileId}_${file.name}`;
            break;
        }
        const promiseArray = [];
        if (file.ownerId === walletId) {
          promiseArray.push(Files.deleteFileFromAllWalletsV2(walletId, file.fileId));
          promiseArray.push(s3
            .deleteObject({
              Bucket: BUCKET_NAME_FILES,
              Key,
            })
            .promise());
        } else {
          promiseArray.push(Files.deleteFile(file.id));
        }
        await Promise.all(promiseArray);
      }),
    );

    return utils.send(StatusCodes.ACCEPTED);
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
