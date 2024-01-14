const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');
// change to revoked
const { deleteShareNFT, getSharedNft } = require('./lib/model/nftShared');
const {
  getAccessRequestByRequestId,
  upsertRequest,
} = require('./lib/model/requestAccess');

module.exports.handler = async (event) => {
  const user = await utils.verifyAccessToken(event);
  const userWalletId = user.walletId || user.walletName;

  const { requestId } = event.pathParameters;
  let updatedRequest = {};
  try {
    if (!requestId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "requestId" is required.',
      });
    }
    const accessRequest = await getAccessRequestByRequestId(requestId);

    if (!accessRequest) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message:
          'There is no Access request associated with the provided `requestId`.',
      });
    }
    if (accessRequest.ownerId !== userWalletId) {
      return utils.send(StatusCodes.FORBIDDEN, {
        message: 'User does not have access to the Request',
      });
    }
    const { requesterId, nftId, ownerId } = accessRequest;

    const nftShared = await getSharedNft(nftId, ownerId, requesterId);
    if (!nftShared) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: 'There is no shared Nft associated with the provided details.',
      });
    }
    updatedRequest = await upsertRequest({
      requestId,
      status: 'revoked',
    });

    // TODO delete the share check impact on blockchain

    await deleteShareNFT(nftShared.shareId);

    return utils.send(StatusCodes.OK, {
      message: 'Shared nft access revoked successfully.',
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
