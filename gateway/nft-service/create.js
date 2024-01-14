/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
const { StatusCodes } = require('http-status-codes');
const { nanoid } = require('nanoid');
const utils = require('./utils');
// const NftCollections = require('./lib/model/collections');
const NftCategories = require('./lib/model/categories');
const schema = require('./validation/create-nft-schema');
const { createNFT } = require('./lib/model/nft');
const HttpError = require('./lib/error');

function cleanInput(input) {
  const output = { ...input };
  const keys = Object.keys(output);
  // eslint-disable-next-line no-restricted-syntax
  for (const key of keys) {
    if (typeof output[key] === 'string') {
      output[key] = output[key].trim();
    }
    if (output[key] === '') {
      delete output[key];
    }
  }
  const cleanTags = [];
  if (output && output.tags) {
    for (let i = 0; i < output.tags.length; i += 1) {
      if (
        // eslint-disable-next-line operator-linebreak
        typeof output.tags[i] === 'string' &&
        output.tags[i].trim().length > 0
      ) {
        cleanTags.push(output.tags[i]);
      }
    }
  }
  output.tags = cleanTags;
  return output;
}
async function sendTransaction(data, token) {

  const params = {
    senderWalletId: data.receiverWalletId,
    ownerWalletId: data.senderWalletId,
    ownerId: data.ownerId,
    type: 'create_and_mint_nft',
    name: data.title,
    capacity: data.capacity || '1',
    appId: '1',
    actionId: '1',
    media: data.filePath,
    reference: data.filePath,
    deposit: '0.1',
  };

  console.log('createdNft - sendTransaction params',params);

  // // Data validation retrieved from transaction-service/validation/create-and-mint-nft-schema.js
  // eslint-disable-next-line operator-linebreak
  const { statusCode, body: transactionResponse } =
    await utils.callServerRequest('transactions', 'post', token, params);
  console.log('createdNft - sendTransaction response statusCode ',statusCode);
  console.log('createdNft - sendTransaction response transactionResponse ',transactionResponse);

  if (statusCode !== StatusCodes.OK) {
    // console.error(
    //   `Transaction failed: ${transactionResponse.message}`,
    //   transactionResponse
    // );
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      // eslint-disable-next-line no-nested-ternary
      'data' in transactionResponse
        ? Array.isArray(transactionResponse.data)
          ? `Failed to create transaction. ${transactionResponse.data
            .map((item) => item.message)
            .join(', ')}`
          : `Failed to create transaction. ${transactionResponse.data}`
        : `Transaction failed: ${transactionResponse.message}`,
    );
  }
  console.log("createdNft - before");
  const createdNft = await createNFT({
    ...data,
    nftId: nanoid(),
    status: transactionResponse.data.blockchainStatus,
    transactionId: transactionResponse.data.transactionId,
  });

  console.log("createdNft - at",createdNft);

  return createdNft;
}
module.exports.sendTransaction = sendTransaction;
console.log("module.exports.sendTransaction");
module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const data = { ...cleanInput(body) };

    const { error } = schema.validate(data, utils.schemaOptions);

    if (error) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        error.details.map((x) => x.message).join(', '),
        error.details,
      );
    }
    const user = await utils.verifyAccessToken(event);
    // TODO: make a decision here is: it walletId or walletName
    data.senderWalletId = user.walletId || user.walletName;
    if (data.ownerWalletId) {
      data.senderWalletId = data.ownerWalletId; // TODO: remove this later after FE have updated allow fallback to prevent FE crashing
    } else {
      data.ownerWalletId = data.senderWalletId;
    }
    data.ownerId = user.userId;
    if (!data.receiverWalletId) {
      data.receiverWalletId = data.senderWalletId;
    }
    const token = event.headers.Authorization || event.headers.authorization;

    console.log("token - ",token);


    const [
      // collection,
      category,
    ] = await Promise.all([
      // NftCollections.getById(data.collectionId),
      NftCategories.getById(data.categoryId),
    ]);
    // TODO: when the front end will be sending the collectionId uncomment this part
    // if (!collection) {
    //   throw new HttpError(
    //     StatusCodes.NOT_FOUND,
    //     `NFT collection '${data.collectionId}' not found`,
    //   );
    // }
    // // TODO: is collection ownerId = walletId or ownerId = userId ?
    // if (collection.ownerId !== user.userId) {
    //   throw new HttpError(
    //     StatusCodes.UNAUTHORIZED,
    //     { message: `You don't have access to collection '${data.collectionId}'` },
    //   );
    // }

    if (!category) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `NFT category '${data.categoryId}' not found`,
      );
    }

    console.log('data we have - ',data);    
    const createdNft = await sendTransaction(data, token);
    console.log('data createdNft - ',createdNft);


    return utils.send(StatusCodes.OK, {
      message: 'NFT created successfully.',
      data: createdNft,
    });
  } catch (e) {
    return utils.send(
      e.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: 'Error create NFT',
        data: e.message,
      },
      e,
    );
  }
};
