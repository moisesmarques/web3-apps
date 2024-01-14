const Joi = require('joi');

module.exports = Joi.object({
  ownerWalletId: Joi.string()
    .pattern(
      /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
    )
    .required(),
  receiverWalletId: Joi.string()
    .pattern(
      /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
    )
    .required(),
  nearAmount: Joi.number().required(),
  notes: Joi.string(),
  type: Joi.string().valid('send_token').required(),
});
