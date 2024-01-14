const Joi = require('joi');

module.exports.createFolderJoi = Joi.object().keys({
  name: Joi.string()
    .pattern(/^[^\\\\\/\?\*\:\|\"\.<>]+$/)
    .min(1)
    .required()
    .messages({
      'any.required': 'Folder name is required',
      'string.pattern.base': 'Folder name includes invalid character',
      'string.min': 'Folder name length should be greater than 1 character.',
    }),
  parentFolderId: Joi.string().default('root'),
  description: Joi.string().default(null),
});

module.exports.updateFolderJoi = Joi.object().keys({
  name: Joi.string()
    .pattern(/^[^\\\\\/\?\*\:\|\"\.<>]+$/)
    .min(1)
    .required()
    .messages({
      'any.required': 'Folder name is required',
      'string.pattern.base': 'Folder name includes invalid character',
      'string.min': 'Folder name length should be greater than 1 character.',
    }),
  parentFolderId: Joi.string().optional(),
  description: Joi.string().optional(),
});

module.exports.createFileSharteInvitationJoi = Joi.object().keys({
  inviteeChannel: Joi.string().valid('email', 'phone').required(),
  inviteeAddress: Joi.string().required(),
});

module.exports.updateFileJoi = Joi.object().keys({
  name: Joi.string().trim()
    .pattern(/^[^\\\\\/\?\*\:\|\"\.<>]+$/)
    .min(1)
    .required()
    .messages({
      'any.required': 'File name is required',
      'string.pattern.base': 'File name includes invalid character',
      'string.min': 'File name length should be greater than 1 character.',
      'string.empty': 'File name should not contain only spaces',
    }),
});

module.exports.createFileJoi = Joi.object().keys({
  name: Joi.string().trim()
    .pattern(/^[^\\\\\/\?\*\:\|\"\.<>]+$/)
    .min(1)
    .required()
    .messages({
      'any.required': 'File name is required',
      'string.pattern.base': 'File name includes invalid character',
      'string.min': 'File name length should be greater than 1 character.',
      'string.empty': 'File name should not contain only spaces',
    }),
});
