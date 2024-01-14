const { StatusCodes } = require('http-status-codes');
const { nanoid } = require('nanoid');
const utils = require('../../utils');
const schema = require('../../validation/generate-seedphrase-schema.js');

const reqId = nanoid();

module.exports.handler = async (event) => {
  try {
    const params = JSON.parse(event.body);

    const { error } = schema.validate(params, { abortEarly: false });
    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: error.details.map((item) => item.message).join(', '),
      });
    }

    const { userId } = await utils.verifyAccessToken(event);

    const { walletName } = params;
    const wallet = await utils.checkWalletNameExists(walletName);
    if (!wallet) {
      return utils.send(StatusCodes.NOT_FOUND, {
        message: 'Wallet not found',
      });
    }

    if (wallet.userId !== userId) {
      return utils.send(StatusCodes.FORBIDDEN, {
        message: 'You are not allowed to perform this action',
      });
    }

    if (wallet.is_passphrase_requested) {
      return utils.send(StatusCodes.CONFLICT, {
        message: 'Passphrase already requested',
      });
    }

    await updateWalletPassphraesRequestStatus(walletName);

    const response = {
      status: true,
      message: 'Wallet Passphrase requested successfully',
    };

    return utils.send(StatusCodes.CREATED, response);
  } catch (err) {
    console.log(`reqId: ${reqId}, login err`, err);
    return utils.send(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: `${err.message}`,
    });
  }
};

const updateWalletPassphraesRequestStatus = async (walletName) => {
  try {
    const params = {
      TableName: process.env.DYNAMODB_WALLET_TABLE,
      Key: {
        walletId: walletName,
      },
      UpdateExpression:
        'set #is_passphrase_requested = :is_passphrase_requested, export_timestamp = :export_timestamp',
      ExpressionAttributeValues: {
        ':is_passphrase_requested': true,
        ':export_timestamp': +new Date(),
      },
      ExpressionAttributeNames: {
        '#is_passphrase_requested': 'is_passphrase_requested',
      },
      ReturnValues: 'UPDATED_NEW',
    };
    const result = await utils.dynamoDb.update(params);
    return result;
  } catch (err) {
    throw new Error('Failed to update wallet passphrase request');
  }
};
