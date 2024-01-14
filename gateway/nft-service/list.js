const { StatusCodes } = require('http-status-codes');
const { listNftByOwnerId } = require('./lib/model/nft');
const { getTransactionById } = require('./lib/model/transaction');
const { getFileById } = require('./lib/model/files');
const utils = require('./utils');
const HttpError = require('./lib/error');

module.exports.handler = async (event) => {
  try {
    const user = await utils.verifyAccessToken(event);

    // TODO: make a decision here is: it walletId or walletName
    const ownerWalletId = user.walletId || user.walletName;
    if (!ownerWalletId) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'User does not have any wallet associated with it\'s identity',
      );
    }
    const nfts = await listNftByOwnerId(ownerWalletId);
    console.log('all the nfts are ', nfts);
    const data = await Promise.all(
      nfts.map(async (nft) => {
        if (!nft.transactionId) {
          return nft;
        }
        const transaction = await getTransactionById(nft.transactionId);
        let fileType;
        if (nft.fileId) {
          const file = await getFileById(ownerWalletId, nft.fileId);
          fileType = (file && file.description) ? JSON.parse(file.description).type : '';
        }
        return {
          ...nft,
          status: (transaction) ? transaction.status : '',
          fileType,
        };
      }),
    );
    return utils.send(StatusCodes.OK, {
      message: 'NFT Collections retrieved successfully.',
      data,
    });
  } catch (err) {
    return utils.send(
      err.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: 'Error NFT Collection',
        data: err.message,
      },
      err,
    );
  }
};
