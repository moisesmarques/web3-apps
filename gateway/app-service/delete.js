const { StatusCodes } = require('http-status-codes');
const { deleteApp, getApp } = require('./lib/model/deleteApp');
const utils = require('./utils');

module.exports.handler = async (event) => {
// delete updates status to archived
  try {
    const { appId } = event.pathParameters;

    if (!appId) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'Missing appId path param',
        data: {},
      });
    }

    await utils.verifyAccessToken(event);

    const appInfo = await getApp(appId);
    if (!appInfo) {
      return utils.send(StatusCodes.BAD_REQUEST, {
        message: 'APP not found. Please check your app id',
      });
    }

    await deleteApp(appId);

    return utils.send(StatusCodes.OK, {
      message: 'App deleted successfully.',
    });
  } catch (e) {
    if (!e.status) {
      console.error(e.message, e);
    }
    return utils.send(
      e.status || StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: 'Error in delete App',
        data: e.message,
      },
      e,
    );
  }
};
