/* eslint-disable semi */
/* eslint-disable no-empty */
// eslint-disable-next-line import/no-extraneous-dependencies

const { StatusCodes } = require('http-status-codes');
const { v5: uuidv5 } = require('uuid');
const utils = require('../../utils');
const Folders = require('../../src/models/folders')
const { verifyUser } = require('../../user');
const { createFolderJoi } = require('../../src/lib/joiSchema');

const { PRIME_LAB_NAME_SPACE } = process.env;

module.exports.handler = async (event) => {
  /**
   * 1. Validate incoming request body using Joi
   * 2. Check if parentFolderId is there in body, if yes.. check for it's data
   * 3. If no parentFolder data found, throw appropriate error.
   * 4. Create new folder for the user.
   * 5. Return data.
   */
  console.log(event);
  try {
    if (!event.body) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Invalid JSON Body',
      });
    }
    let body = JSON.parse(event.body);
    const {
      pathParameters: { walletId },
    } = event;

    const { error, value } = createFolderJoi.validate(body, { abortEarly: false });
    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'One or more fields are invalid or missing.',
        data: error.details.map((item) => item.message),
      });
    }
    body = value;
    const { parentFolderId = 'root' } = body;

    const { walletName } = await verifyUser(event);
    if (walletName !== walletId) {
      return utils.send(StatusCodes.UNAUTHORIZED, {
        message: 'Wallet associated with user mismatch with stored wallet',
        data: {},
      });
    }
    let folderId;

    if (parentFolderId !== 'root') {
      folderId = uuidv5(body.name.toLowerCase(), parentFolderId);

      const parentFolderData = await Folders.getFolderById(parentFolderId)
      if (parentFolderData.Items.length === 0) {
        return utils.send(StatusCodes.NOT_FOUND, {
          message: `No parent folder '${parentFolderId}' associated with this wallet`,
          data: {},
        });
      }
    } else {
      const nameSpace = uuidv5(walletId, PRIME_LAB_NAME_SPACE);
      folderId = uuidv5(body.name.toLowerCase(), nameSpace);
    }

    // check folderId existance in DynamoDB
    const folderIdfromDDB = await Folders.getFolderById(folderId);

    if (folderIdfromDDB.Items.length > 0) {
      return utils.send(StatusCodes.CONFLICT, {
        message: `Folder with name '${body.name}' already exists.`,
        data: {},
      });
    }

    // Note: OwnerId will be walletId because we are storing ownerWalletId as ownerId.
    // As folder is being created for the owner - his walletId will become ownerId

    const params = {
      id: folderId,
      walletId,
      pk: `FOLDER#id=${folderId}`,
      sk: `walletId=${walletId}`,
      name: body.name,
      description: body.description,
      parentFolderId: parentFolderId === 'root' ? null : parentFolderId,
      ownerId: walletId,
      size: 0,
      status: 'active',
      created: +new Date(),
      ...(parentFolderId !== 'root' ? {
        pk1: `FOLDER#walletId=${walletId}#parentFolderId=${parentFolderId}`,
      } : {
        pk1: `FOLDER#walletId=${walletId}`,
      }),
      sk1: `id=${folderId}`,

    }
    console.log('params: ', params)
    const data = await Folders.upsertFolder(params)
    return {
      data,
      message: 'Folder created successfully',
    }
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
