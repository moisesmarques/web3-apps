const { StatusCodes } = require('http-status-codes');
const { listSharedNftByOwnerWalletId } = require('./lib/model/nftShared');
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
    const nfts = await listSharedNftByOwnerWalletId(walletId);

    for (let index = 0; index < nfts.length; index++) {
      const element = nfts[index];
      const nftDetails = await Nft.getNftById(element.nftId);
      const recipientDetails = await Users.getUserByWallet(
        element.recipientWalletId,
      );
      nfts[index] = { ...element, recipientDetails, nftDetails };
    }

    return utils.send(StatusCodes.OK, {
      message: "NFT's sharing with other retrieved successfully.",
      nfts,
    });
  } catch (err) {
    return utils.send(
      err.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Error Sharing NFT's",
        data: err.message,
      },
      err,
    );
  }
};
