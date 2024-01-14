const Joi = require('joi');

module.exports = Joi.object({
  nftId: Joi.string().min(1).max(50).required(),
  ownerWalletId: Joi.string()
    .required()
    .pattern(
      /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
    ),
  title: Joi.string().required().trim(),
  description: Joi.string().required().trim(),
  categoryId: Joi.string()
    .required()
    .pattern(/^[a-zA-Z0-9-_]{21}$/),
  filePath: Joi.string()
    .uri({
      scheme: ['http', 'https'],
      domain: { allowFullyQualified: true },
    })
    .required(),
  price: Joi.string()
    .trim()
    .regex(/^[0-9]\d*(\.\d+)?$/)
    .required(),
});
