const { StatusCodes } = require('http-status-codes');
const { nanoid } = require('nanoid');
const utils = require('./utils');
const { createShareNFT } = require('./lib/model/nftShared');
const { getNftById } = require('./lib/model/nft');
const HttpError = require('./lib/error');

module.exports.handler = async (event) => {
  try {
    const userInfo = await utils.verifyAccessToken(event);

    const { nftId, recipientWalletId } = event.pathParameters;

    if (!nftId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "nftId" is required.',
      });
    }

    if (!recipientWalletId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "recipientWalletId" is required.',
      });
    }

    const ownerWalletId = userInfo.walletId || userInfo.walletName;
    if (!ownerWalletId) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "User does not have any wallet associated with it's identity",
      );
    }

    const nftDetails = await getNftById(nftId);

    if (ownerWalletId !== nftDetails.ownerWalletId) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'You are not authorized to share this NFT.',
      );
    }

    const shareNfts = await createShareNFT({
      shareId: nanoid(),
      nftId,
      ownerWalletId,
      recipientWalletId,
    });

    return utils.send(StatusCodes.OK, {
      message: 'NFT Shared Successfully.',
      data: shareNfts,
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
