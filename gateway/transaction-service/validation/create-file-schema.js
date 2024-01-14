const Joi = require('joi');

module.exports = Joi.object({
  senderWalletId: Joi.string()
    .pattern(
      /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
    )
    .required(),
  fileHash: Joi.string().required(),
  type: Joi.string().valid('create_file').required(),
});
