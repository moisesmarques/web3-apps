const { StatusCodes } = require('http-status-codes');
const map = require('lodash/map');
const cfsign = require('aws-cloudfront-sign');
const utils = require('../../utils');
const Files = require('../../src/models/files');
const { verifyUser } = require('../../user');
const { getWallet } = require('../../src/models/wallets');
const HttpError = require('../../error');
const { getSecret } = require('../../src/lib/sm');
const Version = require('../../src/lib/versioning');

const {
  CLOUDFRONT_URL,
  CLOUDFRONT_SECRET_NAME,
  SIGNED_URL_EXPIRATION = 15 * 60, // 15 minutes
} = process.env;
module.exports.handler = async (event) => {
  // TODO: use a library that handles log sampling according to stage
  // console.log('event', JSON.stringify(event));
  try {
    const {
      pathParameters: { walletId },
      headers: { appid },
    } = event;
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

    const fileList = await Files.getSharedFiles(walletId, appid);

    // public_url & url
    const secret = await getSecret(CLOUDFRONT_SECRET_NAME);
    const { PUBLIC_KEY_ID, PRIVATE_KEY } = JSON.parse(secret);
    const signingParams = {
      keypairId: PUBLIC_KEY_ID,
      privateKeyString: Buffer.from(PRIVATE_KEY, 'base64').toString('ascii'),
      expireTime: new Date().getTime() + +SIGNED_URL_EXPIRATION * 1000,
    };

    const files = map(
      fileList.filter((file) => !!file.hash),
      (file) => {
        const fileFolderId = file.folderId || 'root';
        let Key;
        switch (file.version) {
          case Version.v1:
            Key = `${file.ownerId}/${fileFolderId}/${file.fileId}`;
            break;
          default:
            Key = `${file.ownerId}/${fileFolderId}/${file.fileId}_${file.name}`;
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

    // return all shared files except those that was not uploaded
    return utils.send(
      StatusCodes.OK,
      files,
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
