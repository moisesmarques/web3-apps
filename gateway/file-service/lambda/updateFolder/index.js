/* eslint-disable max-len */
/* eslint-disable semi */
/* eslint-disable no-empty */
// eslint-disable-next-line import/no-extraneous-dependencies

const { StatusCodes } = require('http-status-codes');
const utils = require('../../utils');
const Folders = require('../../src/models/folders')
const { verifyUser } = require('../../user');
const { getWallet } = require('../../src/models/wallets');

const { updateFolderJoi } = require('../../src/lib/joiSchema');
const HttpError = require('../../error');

module.exports.handler = async (event) => {
  /**
   * 1. Validate incoming request body using Joi
   * 2. Check if name, description and parentFolderId is there in body, if yes.. check for it's data
   * 3. If none of name, description and parentFolderId data found, throw appropriate error.
   * 4. Update the folder for the user.
   * 5. Return data.
   */
  try {
    const {
      body: eventBody,
      pathParameters: { walletId, folderId },
    } = event;
    let body;
    try {
      body = JSON.parse(eventBody);
    } catch (err) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Invalid JSON Body',
        data: {},
      });
    }

    let {
      name,
      description,
      parentFolderId,
    } = body;

    const { error } = updateFolderJoi.validate(body, { abortEarly: false });
    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'One or more fields are invalid or missing.',
        data: error.details.map((item) => item.message),
      });
    }

    const [{ walletName, userId }, wallet] = await Promise.all([
      verifyUser(event),
      getWallet(walletId),
    ]);

    if (!wallet) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Wallet not found');
    }
    if (wallet.userId !== userId || wallet.walletId !== walletName) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Wallet associated with user mismatch with stored wallet',
      );
    }

    const { Items: folder } = await Folders.getFolderById(folderId);
    if (!folder[0]) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `No folder '${folderId}' found`,
      );
    }

    // If user is willing to change parentFolderId then we should check is it available OR not.
    if (parentFolderId && parentFolderId !== 'root') {
      const { Items: parentFolder } = await Folders.getFolderById(parentFolderId);
      if (!parentFolder[0]) {
        throw new HttpError(
          StatusCodes.NOT_FOUND,
          `No parent folder '${parentFolderId}' found`,
        );
      }
    }

    if (![folder[0].walletId, folder[0].ownerId].includes(walletId)) {
      // Wallet requesting the folder is not the owner nor a friend of the owner
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        `No folder '${folderId}' associated with this '${walletId}' wallet`,
      );
    }
    if (!parentFolderId) parentFolderId = folder.parentFolderId
    if (!description) description = folder.parentFolderId
    if (!name) name = folder.name

    const updateFolder = await Folders.upsertFolder({
      ...folder[0],
      name,
      description,
      updated: +new Date(),
      ...(['root', null, undefined].includes(parentFolderId)
        ? { parentFolderId: 'root', pk1: `FOLDER#walletId=${folder[0].walletId}` }
        : { parentFolderId, pk1: `FOLDER#walletId=${folder[0].walletId}#parentFolderId=${parentFolderId}` }),
    });

    return {
      updateFolder,
      message: 'Folder updated successfully',
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
