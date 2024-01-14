const Joi = require('joi');

const user_auth = Joi.object({
  walletID: Joi.string()
    .min(2)
    .pattern(
      /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
    )
    .required()
    .messages({
      'string.pattern.base': 'walletID fails to match the required pattern',
      'string.base': 'walletID must be a type of string',
      'string.empty': 'walletID must contain value',
      'any.required': 'walletID is a required field',
    }),
  OTP: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'number.pattern.base': 'OTP fails to match the required pattern',
      'number.base': 'OTP must be a type of number',
      'number.empty': 'OTP must contain value',
      'any.required': 'OTP is a required field',
    }),
  // channelType: Joi.string().valid('email', 'phone').required().messages({
  //   'string.base': `channelType must be a type of string`,
  //   'string.required': `channelType must be one of [email, phone]`,
  // }),
});

const app_schema = Joi.object({
  appId: Joi.string().min(6).max(25).required(),
});
module.exports = {
  user_auth,
  app_schema,
};
