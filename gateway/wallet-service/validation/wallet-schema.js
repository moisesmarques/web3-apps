const Joi = require('joi');

module.exports = Joi.object({
  walletId: Joi.string().pattern(
    /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
  ),
  userId: Joi.string()
    .pattern(/^[a-zA-Z0-9_\- ]{1,21}$/)
    .required(),
  walletName: Joi.string()
    .pattern(
      /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
    )
    .required(),
  email: Joi.alternatives().conditional('phone', {
    is: Joi.any().valid(null, ''),
    then: Joi.string().pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
    otherwise: Joi.any().valid(null, ''),
  }),
  phone: Joi.alternatives().conditional('email', {
    is: Joi.any().valid(null, ''),
    then: Joi.string().pattern(/^[0-9]+$/),
    otherwise: Joi.any().valid(null, ''),
  }),
});
// TODO: add validation where both can exist but both can't be none
