const Joi = require('joi');

module.exports = Joi.object({
  action: Joi.string().equal('approved', 'rejected').required(),
  note: Joi.string().when('action', {
    is: Joi.string().equal('approved'),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
});
