const { StatusCodes } = require('http-status-codes');
const { listSharedNftByRecipientWalletId } = require('./lib/model/nftShared');
const Users = require('./lib/model/users');
const Nft = require('./lib/model/nft');
const utils = require('./utils');
const HttpError = require('./lib/error');

module.exports.handler = async (event) => {
  try {
    const user = await utils.verifyAccessToken(event);
    const walletId = user.walletId || user.walletName;
    if (!walletId) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'User not found!!');
    }
    const nfts = await listSharedNftByRecipientWalletId(walletId);

    for (let index = 0; index < nfts.length; index += 1) {
      const element = nfts[index];
      const nftDetails = await Nft.getNftById(element.nftId);
      const recipientDetails = await Users.getUserByWallet(
        element.ownerWalletId,
      );
      nfts[index] = { ...element, recipientDetails, nftDetails };
    }

    return utils.send(StatusCodes.OK, {
      message: "NFT's Shared with me retrieved successfully.",
      data: nfts,
    });
  } catch (err) {
    return utils.send(
      err.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: 'Error Shared NFTs',
        data: err.message,
      },
      err,
    );
  }
};
