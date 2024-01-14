const { StatusCodes } = require('http-status-codes');
const { listNftByOwnerId } = require('./lib/model/nft');
const { getTransactionById } = require('./lib/model/transaction');
const { getContact } = require('./lib/model/contacts');
const { listUserWallets } = require('./lib/model/wallets');
const utils = require('./utils');
const HttpError = require('./lib/error');

module.exports.handler = async (event) => {
  try {
    const { contactId } = event.pathParameters;

    const user = await utils.verifyAccessToken(event);

    const userWalletId = user.walletId || user.walletName;

    if (!contactId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "contactId" is required.',
      });
    }

    const contact = await getContact(contactId);
    if (!contact) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Contact not found by contactId: ${contactId}`
      );
    }

    const ownerId = contact.linkedUserId;
    if (!ownerId) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        'User is not associated with userId'
      );
    }

    const wallets = await listUserWallets(ownerId);

    let data = [];

    for (let wallet of wallets) {
      const ownerWalletId = wallet.walletId;
      const nfts = await listNftByOwnerId(ownerWalletId);
      if (nfts && nfts.length) {
        for (let nft of nfts) {
          const transaction = await getTransactionById(nft.transactionId);
          data.push({
            ...nft,
            status: transaction?.status,
          });
        }
      }
    }

    data = data.map((data) => {
      const isShared = data.receiverWalletId === userWalletId;
      // This will check user have shared permisson true to see the file
      // If not then It will delet the file path from data
      const { filePath, ...rest } = data;
      if (!isShared) {
        return {
          ...rest,
          shared: isShared,
        };
      }
      return {
        ...data,
        shared: isShared,
      };
    });

    if (data && data.length) {
      return utils.send(StatusCodes.OK, {
        message: 'NFTs by contactId retrieved successfully.',
        data,
      });
    }

    // if the list empty, then we should throw a message “ No Collectibles found”
    return utils.send(StatusCodes.NOT_FOUND, {
      message: `No Collectibles found`,
      data: [],
    });
  } catch (err) {
    return utils.send(
      err.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: 'Error NFTs list by contactId',
        data: err.message,
      },
      err
    );
  }
};
