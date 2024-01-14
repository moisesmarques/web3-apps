const Joi = require('joi');

const shareAppSchema = Joi.object({
  contactId: Joi.string().min(6).max(25).required(),
  appId: Joi.string().min(6).max(25).required(),
});

const createAppSchema = Joi.object({
  ownerId: Joi.string().required(),
  categoryId: Joi.string().required().pattern(/^[a-zA-Z0-9-_]{21}$/),
  appName: Joi.string().required(),
  appIcon: Joi.string().uri().required(),
  description: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).required(),
  version: Joi.string().required(),
  developer: Joi.string().required(),
  overview: Joi.string().required(),
  appUrl: Joi.string().uri().required(),
});

module.exports = {
  shareAppSchema,
  createAppSchema,
};
