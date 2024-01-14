const { StatusCodes } = require('http-status-codes');
const { nanoid } = require('nanoid');
const utils = require('./utils');
const { createShareNFT } = require('./lib/model/nftShared');
const {
  getAccessRequestByRequestId,
  upsertRequest,
} = require('./lib/model/requestAccess');

module.exports.handler = async (event) => {
  const { requestId, action } = event.pathParameters;
  let updatedRequest = {};
  try {
    if (!requestId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "requestId" is required.',
      });
    }
    if (!action) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "action" is required.',
      });
    }
    if (!['accept', 'reject'].includes(action)) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "action" is invalid.',
      });
    }
    const user = await utils.verifyAccessToken(event);
    const userWalletId = user.walletId || user.walletName;
    const request = await getAccessRequestByRequestId(requestId);

    if (!request) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'There is no Request associated with given id.',
      });
    }

    if (request.ownerId !== userWalletId) {
      return utils.send(StatusCodes.FORBIDDEN, {
        message: 'User does not have access to this Request',
      });
    }

    if (request.status && request.status !== 'pending') {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'You have already made decision on this Request.',
      });
    }

    updatedRequest = await upsertRequest({
      requestId,
      status: `${action}ed`,
    });

    if (action === 'accept') {
      await createShareNFT({
        shareId: nanoid(),
        nftId: request.nftId,
        ownerWalletId: user.walletId || user.walletName,
        recipientWalletId: request.requesterId, // need to change this with wallet Id
        requestId,
      });
    }

    return utils.send(StatusCodes.OK, {
      message: 'Access request updated successfully.',
      data: updatedRequest,
    });
  } catch (err) {
    return utils.send(
      err.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: 'Error performing action',
        data: err.message,
      },
      err,
    );
  }
};
