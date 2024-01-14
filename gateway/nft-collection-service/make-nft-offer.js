const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');
const schema = require('./validation/make-nft-offer-schema');
const { createOffer } = require('./lib/model/nft-offer');
const { OfferAction, verifyAccessToken } = require('./utils');
const { getNftById } = require('./lib/model/nft');
const { getShareNftById } = require('./lib/model/nft-share');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const {
      pathParameters: { nftId },
    } = event;
    const { error } = schema.validate(body, { abortEarly: false });
    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'One or more fields are invalid or missing.',
        data: error.details.map((item) => item.message),
      });
    }

    const user = await verifyAccessToken(event);

    if (!nftId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "nftId" is required.',
      });
    }

    const [sharedNftDetails, nftDetails] = await Promise.all([
      getShareNftById(nftId),
      getNftById(nftId),
    ]);

    if (sharedNftDetails.length === 0 || sharedNftDetails[0].recipientWalletId !== user.walletId) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: 'You can make offer only with the NFT shared with you',
      });
    }

    if (!nftDetails) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: `NFT not found by nftId: ${nftId} !`,
      });
    }

    body.nftId = nftId;
    body.action = OfferAction.INITIAL;
    const result = await createOffer(Object.assign(nftId, body));

    return utils.send(StatusCodes.OK, {
      message: 'The NFT offer has been initialized successfully.',
      data: result,
    });
  } catch (error) {
    return utils.send(error.status || StatusCodes.INTERNAL_SERVER_ERROR, {
      message: error.message,
      data: error.data,
    });
  }
};
