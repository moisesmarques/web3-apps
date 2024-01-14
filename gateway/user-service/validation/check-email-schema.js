const Joi = require('joi');

module.exports = Joi.object({
  email: Joi.string().pattern(
    /^[_a-z0-9-]+(\.[_a-z0-9-]+)*(\+[a-z0-9-]+)?@[a-z0-9-]+(\.[a-z0-9-]+)*$/i,
  ),
});
