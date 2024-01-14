const Joi = require('joi');

module.exports = Joi.object({
  walletName: Joi.string()
    .min(2)
    .pattern(/^(?!_)(\w)[\w-]{2,64}(.testnet$)|[\w-]{2,64}(.near$)/)
    .pattern(
      /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
    )
    .required()
    .messages({
      'string.pattern.base': 'walletId fails to match the required pattern',
      'string.base': 'walletId must be a type of string',
      'string.empty': 'walletId must contain value',
      'any.required': 'walletId is a required field',
    }),

  firstName: Joi.string()
    .min(1)
    .max(100)
    .pattern(/^[a-zA-Z- ]+$/)
    .required()
    .messages({
      'string.pattern.base':
        "Firstname must be all Characters: can't have numbers in your name",
      'string.base': 'firstName must be a type of string',
      'string.empty': 'firstName must contain value',
      'any.required': 'firstName is a required field',
    }),

  lastName: Joi.string()
    .min(1)
    .max(100)
    .pattern(/^[a-zA-Z- ]+$/)
    .required()
    .messages({
      'string.pattern.base':
        "Lastname must be all Characters: can't have numbers in your name",
      'string.base': 'lastName must be a type of string',
      'string.empty': 'lastName must contain value',
      'any.required': 'lastName is a required field',
    }),

  dob: Joi.string(),

  nftId: Joi.string().pattern(/^[a-zA-Z0-9-_]{21}$/),
})
  .keys({
    countryCode: Joi.string().pattern(/^\+(?:[0-9] ?){0,3}[0-9]$/),
    phone: Joi.string()
      .messages({
        'string.pattern.base': 'Phone Should be between 10 and 15 number.',
      })
      .min(10)
      .max(15)
      .pattern(/^(?:[0-9] ?){6,14}[0-9]$/),
    email: Joi.string().pattern(
      /^[_a-z0-9-]+(\.[_a-z0-9-]+)*(\+[a-z0-9-]+)?@[a-z0-9-]+(\.[a-z0-9-]+)*$/i,
    ),
  })
  .or('phone', 'email')
  .and('phone', 'countryCode')
  .messages({
    'object.missing': 'Email or Phone is required',
    'object.and': 'Phone and Country Code are both required',
  });
