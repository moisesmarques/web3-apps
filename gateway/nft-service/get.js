const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');
const Nfts = require('./lib/model/nft');
const User = require('./lib/model/users');
const HttpError = require('./lib/error');

module.exports.handler = async (event) => {
  const { nftId } = event.pathParameters;
  try {
    if (!nftId) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Missing nftId path param');
    }

    const user = await utils.verifyAccessToken(event);
    const nft = await Nfts.getNftById(nftId);
    if (!nft) {
      throw new HttpError(StatusCodes.NOT_FOUND, `NFT '${nftId}' not found`);
    }
    // TODO: make a decision here is: it walletId or walletName
    if (![user.walletId, user.walletName].includes(nft.ownerWalletId)) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        `You don't have the right to access NFT '${nftId}'`,
      );
    }
    // fetch/inject owner information
    const owner = await User.getUser(nft.ownerId);
    if (!owner) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'NFT owner not found');
    }
    nft.owner = owner;
    return utils.send(StatusCodes.OK, {
      message: 'NFT detail retrieved successfully.',
      data: nft,
    });
  } catch (err) {
    return utils.send(
      err.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: 'Error detail NFT',
        data: err.message,
      },
      err,
    );
  }
};
