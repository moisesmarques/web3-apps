const { StatusCodes } = require('http-status-codes');
const { listNftByOwnerId } = require('./lib/model/nft');
const { getTransactionById } = require('./lib/model/transaction');
const { getContact } = require('./lib/model/contacts');
const { listUserWallets } = require('./lib/model/wallets');
const utils = require('./utils');
const HttpError = require('./lib/error');

module.exports.handler = async (event) => {
  // console.log('event', event);

  try {
    await utils.verifyAccessToken(event);
    const { contactId } = event.pathParameters;

    if (!contactId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "contactId" is required.',
      });
    }

    const contact = await getContact(contactId);
    if (!contact) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Contact not found');
    }

    const ownerId = contact.userId;
    if (!ownerId) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "User does not associated with it's identity",
      );
    }

    const Wallets = await listUserWallets(ownerId);

    const promise = [];

    for (const wallet of Wallets) {
      const ownerWalletId = wallet.walletId;
      const nfts = await listNftByOwnerId(ownerWalletId);
      if (nfts && nfts.length) {
        for (const nft of nfts) {
          if (nft.transactionId) {
            promise.push(getTransactionById(nft.transactionId));
          }
        }
      }
    }

    const data = await Promise.all(promise);

    if (data && data.length) {
      return utils.send(StatusCodes.OK, {
        message: 'Transaction by contactId retrieved successfully.',
        data,
      });
    }

    return utils.send(StatusCodes.OK, {
      message: 'No Transaction found',
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
