const axios = require('axios');
const utils = require('../../utils');

/**
 * Fetch user wallets by userid
 */
async function getWalletsByUserID(userId, Authorization) {
  try {
    const param = await utils.getParam('/near/api-gateway/url');
    const response = await axios.get(
      `${param.Parameter.Value}/wallets?user=${userId}`,
      {
        headers: { Authorization },
      },
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getWalletsByUserID,
};
