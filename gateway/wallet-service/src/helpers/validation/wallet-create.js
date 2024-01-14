const Joi = require('joi');

module.exports = Joi.object({
  walletName: Joi.string()
    .min(2)
    .pattern(
      /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
    )
    .required()
    .messages({
      'string.pattern.base': 'wallet name should be within 2-64 characters.',
      'string.base': 'wallet name must be a type of string',
      'string.empty': 'wallet name nameame must contain value',
      'any.required': 'wallet name is a required field',
    }),
  appId: Joi.string().alphanum().max(150),
  walletIconUrl: Joi.string().uri(),
  countryCode: Joi.string().max(4),
});
