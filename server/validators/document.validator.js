const Joi = require('joi');

const uploadDocumentSchema = Joi.object({
  title: Joi.string().trim().max(120).default(''),
  category: Joi.string()
    .valid('academic', 'receipt', 'identity', 'notes', 'fee_challan', 'other')
    .default('other'),
  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim()),
      Joi.string().trim() // handles form-data stringified tags
    )
    .default([]),
});

const updateDocumentSchema = Joi.object({
  title: Joi.string().trim().max(120),
  category: Joi.string().valid(
    'academic',
    'receipt',
    'identity',
    'notes',
    'fee_challan',
    'other'
  ),
  tags: Joi.array().items(Joi.string().trim()),
}).min(1);

module.exports = {
  uploadDocumentSchema,
  updateDocumentSchema,
};
