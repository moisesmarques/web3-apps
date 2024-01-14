const S3 = require('aws-sdk/clients/s3');
const { StatusCodes } = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');
const cfsign = require('aws-cloudfront-sign');
const utils = require('../../utils');
const HttpError = require('../../error');

// TODO: use aliases fro ../../src/models/wallets -> ~models/wallets
const Files = require('../../src/models/files');
const Version = require('../../src/lib/versioning');
// TODO: replace user file by module from user-service/utils when they finish returning decoded
//  value
const { verifyUser } = require('../../user');
const { getWallet } = require('../../src/models/wallets');
const { getSecret } = require('../../src/lib/sm');

const s3 = new S3({ signatureVersion: 'v4' });

const {
  CLOUDFRONT_URL,
  CLOUDFRONT_SECRET_NAME,
  BUCKET_NAME_FILES,
  SIGNED_URL_EXPIRATION = 60 * 15, // 15mn
} = process.env;

module.exports.handler = async (event) => {
  const {
    pathParameters: { fileId, walletId },
  } = event;
  try {
    if (!fileId || fileId === 'null') {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'fileId missing in the request!',
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

    // eslint-disable-next-line max-len
    // TODO: @feature/file-service-andre: verify that the walletId linked to userId otherwise UNAUTHORIZED
    const file = await Files.getFile(walletId, fileId);
    if (!file) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `No file '${fileId}' associated with this wallet`,
      );
    }

    if (![file.walletId, file.ownerId].includes(walletId)) {
      // Wallet requesting the file is not the owner nor a friend of the owner
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'You are not authorized to perform this operation',
      );
    }
    const copyFileId = uuidv4();

    // TODO: handle dataEncryptionKey transfer from owner to new owner
    const copyFile = await Files.upsertFile({
      ...file,
      walletId,
      ownerId: walletId, // Transfer property to current wallet
      fileId: copyFileId,
      userId,
      name: `Copy of ${file.name}`,
    });

    const folderId = file.folderId || 'root';

    let Key;
    let CopySource;
    switch (file.version) {
      case Version.v1:
        Key = `${copyFile.ownerId}/root/${copyFileId}`;
        CopySource = `${BUCKET_NAME_FILES}/${file.ownerId}/${folderId}/${file.fileId}`;
        break;

      default:
        Key = `${copyFile.ownerId}/root/${copyFileId}_${copyFile.name}`;
        CopySource = `${BUCKET_NAME_FILES}/${file.ownerId}/${folderId}/${file.fileId}`;
        break;
    }

    await s3
      .copyObject({
        Bucket: BUCKET_NAME_FILES,
        CopySource,
        Key,
        Metadata: {
          fileId: copyFileId,
          walletId: copyFileId,
        },
      })
      .promise();

    const secret = await getSecret(CLOUDFRONT_SECRET_NAME);
    const { PUBLIC_KEY_ID, PRIVATE_KEY } = JSON.parse(secret);
    const signingParams = {
      keypairId: PUBLIC_KEY_ID,
      privateKeyString: Buffer.from(PRIVATE_KEY, 'base64').toString('ascii'),
    };

    const fileUrl = `https://${CLOUDFRONT_URL}/${Key}`;
    // Generating a signed URL
    const url = cfsign.getSignedUrl(fileUrl, {
      ...signingParams,
      expireTime: new Date().getTime() + +SIGNED_URL_EXPIRATION * 1000,
    });

    return utils.send(StatusCodes.OK, { ...copyFile, url, publicUrl: url });
  } catch (e) {
    if (!e.status) {
      console.error(e.message, e);
    }
    return utils.send(
      e.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: e.message,
        data: e.data,
      },
      e,
    );
  }
};
