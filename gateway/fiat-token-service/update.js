const unirest = require('unirest');

const NEAR_FIAT_URL = 'https://helper.mainnet.near.org/fiat';
const { updateFiatPrice } = require('./lib/model/fiat-token');

module.exports.handler = async () => {
  try {
    const { body } = await unirest.get(NEAR_FIAT_URL);
    await updateFiatPrice('near', body.near);
  } catch (error) {
    console.log('Error while update fiat price of NEAR token', error.message);
  }
  return true;
};
