const Joi = require('joi');

module.exports = Joi.object({
  otp: Joi.string().pattern(/^(?:[0-9] ?){5}[0-9]$/).required(),
}).messages({
  'string.pattern.base': 'OTP should have a length of 6',
});
