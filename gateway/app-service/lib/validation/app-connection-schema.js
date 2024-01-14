const Joi = require('joi');

module.exports = Joi.object({

  appId: Joi.string().pattern(/^[a-zA-Z0-9-_]{21}$/).required(),
});
