// eslint-disable-next-line import/no-extraneous-dependencies
const S3 = require('aws-sdk/clients/s3');
// const { v4: uuidv4 } = require('uuid');
const { StatusCodes } = require('http-status-codes');
const axios = require('axios');

const utils = require('../../utils');
const HttpError = require('../../error');
const Files = require('../../src/models/files');
const Version = require('../../src/lib/versioning');

const s3 = new S3();

const { BUCKET_NAME_FILES } = process.env;

module.exports.handler = async (event) => {
  // TODO: use a library that handles log sampling according to stage
  console.log('event', JSON.stringify(event));
  // console.log(event);
  const {
    body: eventBody,
    pathParameters: { walletId, fileId },
  } = event;
  let body;
  try {
    try {
      body = JSON.parse(eventBody);
    } catch (err) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Invalid JSON Body',
        error: true,
      });
    }
    const { status, url } = body;

    if (status !== 2) {
      return utils.send(StatusCodes.OK, {
        error: false,
        message: 'File is not modified. Update skipped',
      });
    }

    const file = await Files.getFile(walletId, fileId);

    if (!file) {
      throw new HttpError(StatusCodes.NOT_FOUND, `File '${fileId}' not found`);
    }

    // if (file.userId !== userId || file.walletId !== walletId) {
    //   throw new HttpError(
    //     StatusCodes.UNAUTHORIZED,
    //     'You are not allowed to access this resource',
    //   );
    // }

    // const newFileId = uuidv4();
    // const newFileName = `v${new Date().toISOString()}-${file.name}`;

    const { data, headers } = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    const bin = Buffer.from(data, 'binary');

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

    await s3
      .deleteObject({
        Bucket: BUCKET_NAME_FILES,
        Key,
      })
      .promise();

    await s3
      .putObject({
        Bucket: BUCKET_NAME_FILES,
        Body: bin,
        Key,
        ContentType: headers['content-type'],
      })
      .promise();

    const newVersion = await Files.upsertFile({
      ...file,
      walletId,
      ownerId: walletId,
      updated: new Date().toISOString(),
    });

    return utils.send(StatusCodes.OK, {
      error: false,
      message: 'File processed successfully',
      metadata: newVersion,
    });
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
