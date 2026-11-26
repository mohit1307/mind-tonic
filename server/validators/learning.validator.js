const Joi = require('joi');

const createSubjectSchema = Joi.object({
  name: Joi.string().trim().max(80).required().messages({
    'string.empty': 'Subject name is required',
    'any.required': 'Subject name is required',
  }),
  code: Joi.string().trim().max(20).allow('').default(''),
  description: Joi.string().trim().max(500).allow('').default(''),
  color: Joi.string().trim().default('#6366f1'),
  icon: Joi.string().trim().default('BookOpen'),
  targetHours: Joi.number().min(0).max(1000).default(20),
});

const updateSubjectSchema = Joi.object({
  name: Joi.string().trim().max(80),
  code: Joi.string().trim().max(20).allow(''),
  description: Joi.string().trim().max(500).allow(''),
  color: Joi.string().trim(),
  icon: Joi.string().trim(),
  targetHours: Joi.number().min(0).max(1000),
}).min(1);

const addTopicSchema = Joi.object({
  name: Joi.string().trim().max(120).required().messages({
    'string.empty': 'Topic name is required',
    'any.required': 'Topic name is required',
  }),
  notes: Joi.string().trim().max(1000).allow('').default(''),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  confidence: Joi.string().valid('low', 'medium', 'high').default('low'),
  isCompleted: Joi.boolean().default(false),
});

const updateTopicSchema = Joi.object({
  name: Joi.string().trim().max(120),
  notes: Joi.string().trim().max(1000).allow(''),
  difficulty: Joi.string().valid('easy', 'medium', 'hard'),
  confidence: Joi.string().valid('low', 'medium', 'high'),
  isCompleted: Joi.boolean(),
}).min(1);

const reviewTopicSchema = Joi.object({
  quality: Joi.number().integer().min(0).max(5).required().messages({
    'number.base': 'Review rating must be a number between 0 and 5',
    'number.min': 'Review rating must be at least 0 (complete blackout)',
    'number.max': 'Review rating cannot exceed 5 (perfect recall)',
    'any.required': 'Review quality rating is required',
  }),
});

const logSessionSchema = Joi.object({
  subjectId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Subject ID is required',
  }),
  topicId: Joi.string().hex().length(24).allow(null, '').default(null),
  topicName: Joi.string().trim().allow('').default(''),
  durationMinutes: Joi.number().integer().min(1).max(720).required().messages({
    'number.min': 'Duration must be at least 1 minute',
    'any.required': 'Duration in minutes is required',
  }),
  focusRating: Joi.number().integer().min(1).max(5).default(4),
  notes: Joi.string().trim().max(500).allow('').default(''),
  date: Joi.date().iso().default(() => new Date()),
});

module.exports = {
  createSubjectSchema,
  updateSubjectSchema,
  addTopicSchema,
  updateTopicSchema,
  reviewTopicSchema,
  logSessionSchema,
};
