const Joi = require('joi').extend(require('@joi/date'));

module.exports = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(50),
  startDate: Joi.date().format('YYYY-MM-DD').utc(),
  endDate: Joi.date().format('YYYY-MM-DD').utc(),
  type: Joi.string().pattern(/[0-9a-zA-Z.]+/),
  application: Joi.string().pattern(/[0-9a-zA-Z.]+/), // action id
  status: Joi.string().pattern(/[0-9a-zA-Z.]+/),
  lastItem: Joi.string(),
  senderWalletId: Joi.string().pattern(
    /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
  ),
  receiverWalletId: Joi.string().pattern(
    /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
  ),
  walletId: Joi.string().pattern(
    /^(([a-zA-Z\d]([\-\w\d]{1,54})[a-zA-Z\d](.testnet))|([a-zA-Z\d]([\-\w\d]{1,57})[a-zA-Z\d](.near)))/,
  ),
  queryType: Joi.string().equal('All').optional(),
}).min(1);
