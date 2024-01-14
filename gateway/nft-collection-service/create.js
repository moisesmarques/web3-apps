const { StatusCodes } = require('http-status-codes');
const { nanoid } = require('nanoid');
const schema = require('./validation/collection-create-schema');
const utils = require('./utils');
const { createCollection } = require('./lib/model/nft-collection');

const reqId = nanoid();
module.exports.handler = async (event) => {
  try {
    const params = JSON.parse(event.body);
    console.log(`reqId: ${reqId}, Create requestParams`, params);
    const { error } = schema.validate(params);
    if (error) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'One or more fields are invalid.',
        errors: error.details.map((item) => item.message),
      });
    }
    const newCollection = await createCollection(params);
    return utils.send(StatusCodes.CREATED, {
      message: 'NFT collection created successfully.',
      data: newCollection,
    });
  } catch (error) {
    console.log(`reqId: ${reqId}, Create err`, error);

    return utils.send(error.status || StatusCodes.INTERNAL_SERVER_ERROR, {
      message: error.message,
      data: error.data,
    });
  }
};
