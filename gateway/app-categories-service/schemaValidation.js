const Joi = require('joi');

const updateAppCategorySchema = Joi.object({

  name: Joi.string().required(),
  description: Joi.string(),
});

module.exports = {
  updateAppCategorySchema,
};
