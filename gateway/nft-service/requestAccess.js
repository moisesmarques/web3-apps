const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');
const Nfts = require('./lib/model/nft');
const {
  createAccessRequest,
  checkIfRequestExists,
} = require('./lib/model/requestAccess');

module.exports.handler = async (event) => {
  const { nftId } = event.pathParameters;
  if (!nftId) {
    return utils.send(StatusCodes.BAD_REQUEST, {
      message: 'Missing nftId path param',
    });
  }

  try {
    const nft = await Nfts.getNftById(nftId);

    if (!nft) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: `NFT with id '${nftId}' not found`,
      });
    }

    const user = await utils.verifyAccessToken(event);

    const requesterWalletId = user.walletId || user.walletName;
    const ownerWalletId = nft.ownerWalletId ? nft.ownerWalletId : '';

    const requestByUserExists = await checkIfRequestExists(
      nftId,
      requesterWalletId,
    );

    if (requestByUserExists) {
      return utils.send(StatusCodes.CONFLICT, {
        message: 'You have already requested access to this NFT',
      });
    }

    const requestAccess = await createAccessRequest({
      nftId,
      ownerId: ownerWalletId,
      requesterId: requesterWalletId,
      status: 'pending',
    });

    return utils.send(StatusCodes.CREATED, {
      message: 'Access request created successfully.',
      data: requestAccess,
    });
  } catch (err) {
    return utils.send(
      err.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: err.message,
      },
      err,
    );
  }
};
