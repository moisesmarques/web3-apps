const Joi = require('joi');

module.exports = Joi.object({
  nftId: Joi.string().required(),
  action: Joi.string().valid('mint', 'offer', 'counter', 'approved', 'rejected', 'transfer').required(),
  fromWalletId: Joi.string()
    .min(2)
    .pattern(
      /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
    )
    .required()
    .messages({
      'string.pattern.base': 'fromWalletId fails to match the required pattern',
      'string.base': 'fromWalletId must be a type of string',
      'string.empty': 'fromWalletId must contain value',
      'any.required': 'fromWalletId is a required field',
    }),
  toWalletId: Joi.string()
    .min(2)
    .pattern(
      /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
    )
    .messages({
      'string.pattern.base': 'fromWalletId fails to match the required pattern',
      'string.base': 'fromWalletId must be a type of string',
    }),
  amount: Joi.number(),
});
