/* eslint-disable no-await-in-loop */
/* eslint-disable semi */
/* eslint-disable no-empty */
// eslint-disable-next-line import/no-extraneous-dependencies

const { StatusCodes } = require('http-status-codes');
const map = require('lodash/map');
const cfsign = require('aws-cloudfront-sign');
const utils = require('../../utils');
const Folders = require('../../src/models/folders');
const Files = require('../../src/models/files');
const { getWallet } = require('../../src/models/wallets');
const { verifyUser } = require('../../user');
const HttpError = require('../../error');
const { getSecret } = require('../../src/lib/sm');
const Version = require('../../src/lib/versioning');

const {
  CLOUDFRONT_URL,
  CLOUDFRONT_SECRET_NAME,
  SIGNED_URL_EXPIRATION = 15 * 60, // 15 minutes
} = process.env;
module.exports.handler = async (event) => {
  /**
   * 1. Fetch all files by folderId
   * 2. Return data
   */
  console.log(event);
  try {
    const {
      pathParameters: { walletId, folderId },
    } = event;

    const { userId } = await verifyUser(event);

    const parentFolderId = ['root', undefined, null].includes(folderId)
      ? 'root'
      : folderId;

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
    const lists = await Files.getFilesByFolderId(walletId, parentFolderId);
    const folders = await Folders.getChildFoldersByFolderId(
      walletId,
      parentFolderId,
    );

    // public_url & url
    const secret = await getSecret(CLOUDFRONT_SECRET_NAME);
    const { PUBLIC_KEY_ID, PRIVATE_KEY } = JSON.parse(secret);
    const signingParams = {
      keypairId: PUBLIC_KEY_ID,
      privateKeyString: Buffer.from(PRIVATE_KEY, 'base64').toString('ascii'),
      expireTime: new Date().getTime() + +SIGNED_URL_EXPIRATION * 1000,
    };

    const files = map(
      lists.filter((file) => !!file.hash),
      (file) => {
        const fileFolderId = file.folderId || 'root';
        let Key;
        switch (file.version) {
          case Version.v1:
            Key = `${file.ownerId}/${fileFolderId}/${file.fileId}`;
            break;

          default:
            Key = `${file.ownerId}/${fileFolderId}/${file.fileId}_${file.name}`;
            break;
        }

        // Generating a signed URL
        const url = cfsign.getSignedUrl(
          `https://${CLOUDFRONT_URL}/${Key}`,
          signingParams,
        );

        return {
          ...file,
          folderId: fileFolderId,
          url,
          publicUrl: url,
        };
      },
    );

    return {
      message: 'Files and Folders fetched successfully',
      data: {
        files,
        folders,
      },
    };
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
