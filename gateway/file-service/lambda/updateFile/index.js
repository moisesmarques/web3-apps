const S3 = require('aws-sdk/clients/s3');
const { StatusCodes } = require('http-status-codes');
const utils = require('../../utils');
const { verifyUser } = require('../../user');
const Files = require('../../src/models/files');
const Folders = require('../../src/models/folders');
const HttpError = require('../../error');
const { getWallet } = require('../../src/models/wallets');
const Version = require('../../src/lib/versioning');
const { updateFileJoi } = require('../../src/lib/joiSchema');

const s3 = new S3({ signatureVersion: 'v4' });

const { BUCKET_NAME_FILES } = process.env;

module.exports.handler = async (event) => {
  const {
    pathParameters: { fileId, walletId },
    body,
  } = event;

  try {
    if (!fileId || fileId === 'null') {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'fileId missing in the request!',
      );
    }
    if (!body) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'You have pass either Name or DestinationFolderId in Body request',
      );
    }

    const request = JSON.parse(body);
    let { name } = request;

    if (name) {
      // extract name and clean it up for Joi validation
      const validationObj = { name: name.slice(0, name.lastIndexOf('.')) };
      const { error, value } = updateFileJoi.validate(validationObj, {
        abortEarly: false,
      });
      name = `${value.name}.${name.split('.').pop()}`;
      if (error) {
        return utils.send(StatusCodes.BAD_REQUEST, {
          message: 'One or more fields are invalid or missing.',
          data: error.details.map((item) => item.message),
        });
      }
    }
    const { description, destinationFolderId } = request;

    if (name && destinationFolderId) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Cannot pass both Name and DestinationFolderId same time. Name parameter is just for rename file and DestinationFolderId is for move',
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

    const file = await Files.getFile(walletId, fileId);
    if (!file) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `No file '${fileId}' associated with this wallet`,
      );
    }
    if (['', undefined, null].includes(name)) {
      name = file.name;
    }

    // If destinationFolderId that means its regarding the move file
    if (destinationFolderId && destinationFolderId !== 'root') {
      const folder = await Folders.getFolderById(destinationFolderId);
      if (folder.Items.length === 0) {
        throw new HttpError(
          StatusCodes.NOT_FOUND,
          `No folder '${destinationFolderId}' found`,
        );
      } else if (folder.Items[0].walletId !== walletId) {
        throw new HttpError(
          StatusCodes.NOT_FOUND,
          `No folder '${destinationFolderId}' associated with this '${walletId}' wallet`,
        );
      }
    }

    const updatedFolderId = destinationFolderId || file.folderId;
    const folderId = file.folderId || 'root';
    let updateS3;
    let CopySource;
    let Key;
    let OldKey;
    switch (file.version) {
      case Version.v1:
        updateS3 = false;
        OldKey = `${file.ownerId}/${folderId}/${fileId}`;
        CopySource = `${BUCKET_NAME_FILES}/${OldKey}`;
        Key = `${file.ownerId}/${updatedFolderId}/${fileId}`;
        break;

      default:
        updateS3 = true;
        OldKey = `${file.ownerId}/${folderId}/${fileId}_${file.name}`;
        CopySource = `${BUCKET_NAME_FILES}/${OldKey}`;
        Key = `${file.ownerId}/${updatedFolderId}/${fileId}_${name}`;
        break;
    }

    if (updateS3 || destinationFolderId) {
      await s3
        .copyObject({
          Bucket: BUCKET_NAME_FILES,
          CopySource,
          Key,
        })
        .promise();

      await s3
        .deleteObject({
          Bucket: BUCKET_NAME_FILES,
          Key: OldKey,
        })
        .promise();
    }

    try {
      const conditionExpression = walletId === file.walletId && file.access === 'WRITE'
        ? { exp: 'access = :access', value: { ':access': 'WRITE' } }
        : { exp: 'ownerId = :walletId', value: { ':walletId': walletId } };
      const updateFile = await Files.upsertFile(
        {
          fileId,
          walletId,
          name,
          description,
          folderId: updatedFolderId,
        },
        conditionExpression.exp,
        (params) => ({
          ...params,
          ExpressionAttributeValues: {
            ...params.ExpressionAttributeValues,
            ...conditionExpression.value,
          },
        }),
      );
      return utils.send(StatusCodes.OK, { ...updateFile });
    } catch (error) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'File does not exist or you are not authorized to perform this operation',
        error,
      );
    }
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
