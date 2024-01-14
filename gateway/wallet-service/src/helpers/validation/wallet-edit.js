const Joi = require('joi');

module.exports = Joi.object({
  walletName: Joi.string()
    .min(2)
    .pattern(
      /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
    )
    .required()
    .messages({
      'string.pattern.base': 'walletName fails to match the required pattern',
      'string.base': 'walletName must be a type of string',
      'string.empty': 'walletName must contain value',
      'any.required': 'walletName is a required field',
    }),
  status: Joi.string(),
  imageUrlPath: Joi.string().uri(),
  priceLimit: Joi.number(),
  kycProvider: Joi.string().max(50),
  storageProvider: Joi.string().max(50),
});
