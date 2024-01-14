const Joi = require('joi');

module.exports = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .pattern(/^[^\s][a-zA-Z0-9-_]+[a-zA-Z0-9-_\s;&!@#$]+$/)
    .required()
    .messages({
      'string.pattern.base':
        'Title is invalid. Only alphanumeric and _-;&!@#$ are allowed.',
      'string.empty': 'Title must contain value',
      'any.required': 'Title is a required field',
    }),
  description: Joi.string()
    .trim()
    .min(1)
    .max(150)
    .pattern(/^[a-zA-Z0-9-_]+[a-zA-Z0-9-_\s;&!@$]+$/)
    .optional(),
  // TODO: uncomment collectionId when the FE will be sending it
  // collectionId: Joi.string().required().pattern(/^[a-zA-Z0-9-_]{1,21}$/),
  categoryId: Joi.string()
    .required()
    .pattern(/^[a-zA-Z0-9-_]{1,21}$/),
  filePath: Joi.string().uri().required(),
  fileId: Joi.string()
    .required()
    .pattern(/^[a-zA-Z0-9-_]{1,36}$/),
  tags: Joi.array().items(Joi.string().pattern(/^[a-zA-Z0-9]+$/)),
  capacity: Joi.number(),
});
