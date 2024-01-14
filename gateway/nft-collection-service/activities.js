const { StatusCodes } = require('http-status-codes');
const utils = require('./utils');
const { getActivitiesByNftId } = require('./lib/model/nft-activity');

module.exports.handler = async (event) => {
  try {
    await utils.verifyAccessToken(event);
    const {
      pathParameters: { nftId },
    } = event;
    const activities = await getActivitiesByNftId(nftId);

    return utils.send(StatusCodes.OK, {
      message: 'NFT activities retrieved successfully.',
      body: activities,
    });
  } catch (error) {
    return utils.send(error.status || StatusCodes.INTERNAL_SERVER_ERROR, {
      message: error.message,
      data: error.data,
    });
  }
};
