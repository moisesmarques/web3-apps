const { StatusCodes } = require('http-status-codes');
const crypto = require('crypto');

const Wallets = require('../../src/models/wallets');
const utils = require('../../src/helpers/utils');
const schema = require('../../src/helpers/validation/wallet-create');

const { verifyUser } = require('../../src/helpers/auth/user');

const { callBlockchain } = require('../../src/models/transaction');
const HttpError = require('../../src/helpers/exception/error');

module.exports.handler = async (event) => {
  const { body } = event;
  try {
    if (!body) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Payload is missing');
    }
    const request = JSON.parse(body);
    const { error } = schema.validate(request);

    if (error) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'One or more fields are invalid.',
        error.details,
      );
    }

    const {
      appId, walletName, walletIconUrl, actionId,
    } = request;
    const {
      userId, countryCode, phone, email,
    } = await verifyUser(event);
    const walletId = walletName.toLowerCase();

    const walletCheck = await utils.checkWalletNameExists(walletName);
    if (walletCheck) {
      return utils.send(StatusCodes.CONFLICT, {
        message: 'Wallet ID already exist',
      });
    }

    // TODO: Replace the static strings
    let wallet = await Wallets.upsertWallet({
      appId,
      userId,
      walletId,
      walletName: walletName.toLowerCase(),
      blockchainHash: crypto.createHash('sha256', walletName).digest('hex'),
      isBlockchainVerified: 'verified',
      walletIconUrl,
      status: 'pending',
      balance: '0.00',
      kycProvider: 'kyc_provider',
      storageProvider: 'storage_provider',
      publicKey: crypto.createHash('sha256', walletName).digest('hex'),
    });

    const response = await callBlockchain(
      event.headers.Authorization || event.headers.authorization,
      {
        appId: appId || '123456',
        senderWalletId: walletId,
        type: 'create_account',
        actionId: actionId || '1343245',
      },
    );

    if (response && response.data) {
      wallet = await Wallets.updateWalletWithTransactionId(
        walletId,
        response.data.transactionId,
      );
    }

    return utils.send(StatusCodes.CREATED, wallet);
  } catch (e) {
    return utils.send(
      e.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: e.message,
        data: e.data,
      },
      e,
    );
  }
};
