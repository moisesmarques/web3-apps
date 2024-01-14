const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');
const Nfts = require('./lib/model/nft');
const Users = require('./lib/model/users');
const HttpError = require('./lib/error');
const { getAccessRequest } = require('./lib/model/requestAccess');

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
    const { ownerWalletId } = nft;

    if (![user.walletId, user.walletName].includes(ownerWalletId)) {
      return utils.send(StatusCodes.UNAUTHORIZED, {
        message: 'User is not the owner.',
        data: {},
      });
    }

    const nftRequests = await getAccessRequest(nftId);
    const data = [];

    for (let index = 0; index < nftRequests.Items.length; index++) {
      const requesterDetails = await Users.getUser(
        nftRequests.Items[index].requesterId,
      );
      data.push({ requesterDetails, requestDetails: nftRequests.Items[index] });
    }

    return utils.send(StatusCodes.OK, {
      message: 'List NFT access requests.',
      data,
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
