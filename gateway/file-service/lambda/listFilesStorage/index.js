const { StatusCodes } = require('http-status-codes');

const cfsign = require('aws-cloudfront-sign');
const map = require('lodash/map');
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

    const secret = await getSecret(CLOUDFRONT_SECRET_NAME);
    const { PUBLIC_KEY_ID, PRIVATE_KEY } = JSON.parse(secret);

    const files = await Files.getFiles(walletId);
    const signingParams = {
      keypairId: PUBLIC_KEY_ID,
      privateKeyString: Buffer.from(PRIVATE_KEY, 'base64').toString('ascii'),
      expireTime: new Date().getTime() + +SIGNED_URL_EXPIRATION * 1000,
    };

    const list = map(
      files.filter((file) => !!file.hash),
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
        // const url = `https://${CLOUDFRONT_URL}/${filePath}`;
        return {
          ...file,
          url,
          publicUrl: url,
        };
      },
    );
    // return all files except those that was not uploaded
    return utils.send(StatusCodes.OK, list);
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
