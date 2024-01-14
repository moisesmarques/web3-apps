const { StatusCodes } = require('http-status-codes');
const schema = require('./validation/collection-update-schema');
const utils = require('./utils');
const { updateCollection } = require('./lib/model/nft-collection');

module.exports.handler = async (event) => {
  try {
    const {
      pathParameters: { nftCollectionId },
    } = event;
    if (!nftCollectionId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'The path parameter "nftCollectionId" is required.',
      });
    }
    await utils.verifyAccessToken(event);
    const params = JSON.parse(event.body);

    const { error } = schema.validate(params);

    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'One or more fields are invalid.',
        errors: error.details.map((item) => item.message),
      });
    }

    const result = await updateCollection(nftCollectionId, {
      ...params,
    });

    return utils.send(StatusCodes.OK, {
      message: 'NFT collection updated successfully.',
      data: result,
    });
  } catch (error) {
    return utils.send(error.status || StatusCodes.INTERNAL_SERVER_ERROR, {
      message: error.message,
      data: error.data,
    });
  }
};
