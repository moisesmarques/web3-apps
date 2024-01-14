const S3 = require('aws-sdk/clients/s3');
const cfsign = require('aws-cloudfront-sign');
const { StatusCodes } = require('http-status-codes');
const utils = require('../../utils');
const { verifyUser } = require('../../user');
const Files = require('../../src/models/files');
const HttpError = require('../../error');
const Wallets = require('../../src/models/wallets');
const { getSecret } = require('../../src/lib/sm');
const Version = require('../../src/lib/versioning');

const {
  CLOUDFRONT_URL,
  CLOUDFRONT_SECRET_NAME,
  SIGNED_URL_EXPIRATION = 15 * 60, // 15 minutes
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

    const { userId } = await verifyUser(event);

    // Starting from here, user is authenticated
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

    if (file.ownerId !== file.walletId && !file.acceptedAt) {
      // This file is shared and receiver didn't yet acceptted
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'You must accept file share before accessing this file',
      );
    }

    const secret = await getSecret(CLOUDFRONT_SECRET_NAME);
    const { PUBLIC_KEY_ID, PRIVATE_KEY } = JSON.parse(secret);

    const signingParams = {
      keypairId: PUBLIC_KEY_ID,
      privateKeyString: Buffer.from(PRIVATE_KEY, 'base64').toString('ascii'),
      expireTime: new Date().getTime() + +SIGNED_URL_EXPIRATION * 1000,
    };

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

    // Generating a signed URL
    const url = cfsign.getSignedUrl(
      `https://${CLOUDFRONT_URL}/${Key}`,
      signingParams,
    );

    return utils.send(StatusCodes.OK, { ...file, url, publicUrl: url });
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
