const { StatusCodes } = require('http-status-codes');
const Wallets = require('../../src/models/wallets');
const HttpError = require('../../src/helpers/exception/error');
const { verifyUser } = require('../../src/helpers/auth/user');
const utils = require('../../src/helpers/utils');
const { post } = require('axios');
const { STAGE } = process.env;
const NETWORK = STAGE === 'dev' ? 'mainnet' : 'testnet';

module.exports.handler = async (event) => {
  const {
    pathParameters: { walletId },
  } = event;

  try {
    if (!walletId || walletId === 'null') {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'walletId missing in the request!'
      );
    }
    const { userId } = await verifyUser(event);

    const wallet = await Wallets.getWallet(walletId);

    if (!wallet) {
      // Wallet missing. Was it deleted? Maybe
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Invalid wallet ID or does not exist`
      );
    }

    if (wallet.userId !== userId) {
      // Provided walletId is not owned by user
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        `You are not authorized to perform this operation`
      );
    }

    const account = await callAccountRPCNode(walletId);

    if (account.error) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: account.error.data,
        cause: account.error.cause,
      });
    }

    return utils.send(StatusCodes.OK, {
      ...wallet,
      balance: account?.result?.amount / 10 ** 24, // formatted balance by yotta unit
      ...account.result,
    });
  } catch (e) {
    return utils.send(
      e.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: e.message,
        data: e.data,
      },
      e
    );
  }
};

async function callAccountRPCNode(account) {
  try {
    const params = {
      jsonrpc: '2.0',
      id: 'dontcare',
      method: 'query',
      params: {
        request_type: 'view_account',
        finality: 'final',
        account_id: account,
      },
    };

    console.log('params', JSON.stringify(params));
    const URL = `https://rpc.${NETWORK}.near.org`;
    const apiHeaders = {
      'Content-Type': 'application/json',
    };

    const { data } = await post(`${URL}`, params, {
      headers: apiHeaders,
    });
    return data;
  } catch (err) {
    console.log(err);
  }
}
