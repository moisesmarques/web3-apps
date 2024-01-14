const Joi = require('joi');

module.exports = Joi.object({
  channelType: Joi.string().valid('email', 'phone').required().messages({
    'string.base': 'channelType must be a type of string',
    'string.required': 'channelType must be one of [email, phone]',
  }),
});
