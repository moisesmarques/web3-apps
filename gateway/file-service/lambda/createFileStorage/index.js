// eslint-disable-next-line import/no-extraneous-dependencies
const S3 = require('aws-sdk/clients/s3');
const crypto = require('crypto');
// eslint-disable-next-line import/no-extraneous-dependencies
const BPromise = require('bluebird');
const { StatusCodes } = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');
// eslint-disable-next-line import/no-extraneous-dependencies
const cfsign = require('aws-cloudfront-sign');
const utils = require('../../utils');
const HttpError = require('../../error');
// TODO: use aliases fro ../../src/models/wallets -> ~models/wallets
const Wallets = require('../../src/models/wallets');
const Files = require('../../src/models/files');
const Folders = require('../../src/models/folders');
const Version = require('../../src/lib/versioning');

// TODO: replace user file by module from user-service/utils when they finish returning decoded
//  value
const { verifyUser } = require('../../user');
const { getSecret } = require('../../src/lib/sm');
const { createFileJoi } = require('../../src/lib/joiSchema');

const s3 = new S3({ signatureVersion: 'v4' });

const {
  CLOUDFRONT_SECRET_NAME,
  CLOUDFRONT_URL,
  BUCKET_NAME_FILES,
  SIGNED_URL_EXPIRATION = 60 * 15, // 15 minutes
} = process.env;

module.exports.handler = async (event) => {
  // TODO: use a library that handles log sampling according to stage
  console.log('event', JSON.stringify(event));
  // console.log(event);
  const {
    body: eventBody,
    pathParameters: { walletId },
  } = event;
  let body;
  try {
    try {
      body = JSON.parse(eventBody);
    } catch (err) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Invalid JSON Body',
        data: {},
      });
    }
    // eslint-disable-next-line object-curly-newline
    let {
      // eslint-disable-next-line prefer-const
      name, path, description, storageProvider, parts = 0,
    } = body;

    // do name Joi validation
    if (!name) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'One or more fields are invalid or missing.',
        data: 'File name is required',
      });
    }
    const validationObj = { name: name.slice(0, name.lastIndexOf('.')) };
    const { error, value } = createFileJoi.validate(validationObj, {
      abortEarly: false,
    });
    name = `${value.name}.${name.split('.').pop()}`;
    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'One or more fields are invalid or missing.',
        data: error.details.map((item) => item.message),
      });
    }

    const { folderId } = body;

    const { userId } = await verifyUser(event);

    // Starting from here, user is authenticated
    const wallet = await Wallets.getWallet(walletId);
    if (!wallet) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Wallet not found');
    }
    if (wallet.userId !== userId || wallet.walletId !== walletId) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Wallet associated with user mismatch with stored wallet',
      );
    }

    const parentFolderId = ['root', undefined, null].includes(folderId)
      ? 'root'
      : folderId;

    if (parentFolderId && parentFolderId !== 'root') {
      const { Items: folderData } = await Folders.getFolderById(parentFolderId);
      if (!folderData) {
        throw new HttpError(
          StatusCodes.NOT_FOUND,
          `Folder Id '${parentFolderId}' not found`,
        );
      }
    }

    const fileId = uuidv4(); // Generate random UUID V4 as clear data encryption key
    const dataEncryptionKey = uuidv4(); // Generate random UUID V4 as clear data encryption key

    // TODO: see if we can use AWS Encryption SDK (RSA format?) https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/use-raw-rsa-keyring.html
    // TODO: to uncomment when near-walletsPrivate table is created
    // const encryptedDataEncryptionKey = utils.encrypt(dataEncryptionKey, wallet.pubKey);
    // TODO: encrypt dataEncryptionKey with wallet.pubKey before sending back to the client
    const encryptedDataEncryptionKey = dataEncryptionKey;

    const dataEncryptionKeySHA256 = crypto
      .createHash('sha256')
      .update(dataEncryptionKey);
    const dataEncryptionKeyMd5 = crypto
      .createHash('md5')
      .update(dataEncryptionKeySHA256.digest())
      .digest('base64');
    const filePath = folderId
      ? `${walletId}/${folderId}/${fileId}`
      : `${walletId}/root/${fileId}`;
    const url = await s3.getSignedUrlPromise('putObject', {
      Bucket: BUCKET_NAME_FILES,
      Key: filePath,
      Expires: SIGNED_URL_EXPIRATION,
      Metadata: {
        fileId,
        walletId,
      },
    });
    let uploadId;
    let multipartUrls = [];
    if (parts) {
      const { UploadId } = await s3
        .createMultipartUpload({
          Bucket: BUCKET_NAME_FILES,
          Key: filePath,
        })
        .promise();
      uploadId = UploadId;
      multipartUrls = await BPromise.map(
        Array(parts),
        async (_, index) =>
          // eslint-disable-next-line implicit-arrow-linebreak
          s3.getSignedUrl('uploadPart', {
            Bucket: BUCKET_NAME_FILES,
            Key: filePath,
            Expires: SIGNED_URL_EXPIRATION,
            UploadId,
            PartNumber: index + 1,
          }),
        { concurrency: 10 },
      );
    }

    const secret = await getSecret(CLOUDFRONT_SECRET_NAME);
    const { PUBLIC_KEY_ID, PRIVATE_KEY } = JSON.parse(secret);
    const signingParams = {
      keypairId: PUBLIC_KEY_ID,
      privateKeyString: Buffer.from(PRIVATE_KEY, 'base64').toString('ascii'),
    };

    const fileUrl = `https://${CLOUDFRONT_URL}/${filePath}`;
    // Generating a signed URL
    const publicUrl = cfsign.getSignedUrl(fileUrl, {
      ...signingParams,
      expireTime: new Date().getTime() + +SIGNED_URL_EXPIRATION * 1000,
    });

    // // TODO: use signed cookies instead of signed URLs
    // const signedCookies = cfsign.getSignedCookies(`https://${CLOUDFRONT_URL}/${walletId}/*`, signingParams);
    //
    // const cookies = [];
    // map(signedCookies, (cookie)){
    //
    // }

    const { ttl, ...file } = await Files.upsertFile({
      fileId,
      userId,
      walletId,
      ownerId: walletId,
      name,
      path,
      description,
      storageProvider,
      dataEncryptionKey: {
        md5: dataEncryptionKeyMd5,
        encrypted: encryptedDataEncryptionKey,
      },
      ttl: Math.floor(Date.now() / 1000) + SIGNED_URL_EXPIRATION,
      folderId: parentFolderId,
      version: Version.v1,
    });

    const response = {
      ...file,
      url,
      publicUrl,
      ...(multipartUrls.length
        ? { multipart: { urls: multipartUrls, uploadId } }
        : {}),
    };
    return utils.send(StatusCodes.OK, response);
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
