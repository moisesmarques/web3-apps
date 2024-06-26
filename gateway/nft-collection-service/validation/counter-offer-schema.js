const Joi = require('joi');

module.exports = Joi.object({
  offerId: Joi.string()
    .pattern(/^[a-zA-Z0-9_\- ]{1,21}$/)
    .required(),
  price: Joi.number().required(),
  offerType: Joi.string().equal('NFT', 'TOKEN').required(),
  expire: Joi.date().timestamp().required(),
  userId: Joi.string()
    .pattern(/^[a-zA-Z0-9_\- ]{1,21}$/)
    .required(),
});
