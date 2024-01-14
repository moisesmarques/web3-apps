const Joi = require('joi');

module.exports = Joi.object({
  senderWalletId: Joi.string()
    .pattern(
      /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
    )
    .required(),
  type: Joi.string().valid('create_and_mint_nft').required(),
  ownerWalletId: Joi.string().pattern(
    /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
  ),
  ownerId: Joi.string(),
  name: Joi.string().required(),
  capacity: Joi.number().required(),
  appId: Joi.string().required(),
  actionId: Joi.string().required(),
  media: Joi.string().uri().required(),
  reference: Joi.string().uri().required(),
  deposit: Joi.number().required(),
  title: Joi.string(),
  description: Joi.string(),
  mediaHash: Joi.string(),
  copies: Joi.string(),
  issuedAt: Joi.string(),
  expiresAt: Joi.string(),
  startsAt: Joi.string(),
  updatedAt: Joi.string(),
  extra: Joi.string(),
  referenceHash: Joi.string(),
});
