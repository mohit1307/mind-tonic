const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required().messages({
    'string.empty': 'Task title is required',
    'string.min': 'Task title must be at least 2 characters',
    'any.required': 'Task title is required',
  }),
  description: Joi.string().trim().max(2000).allow(''),
  category: Joi.string().valid('work', 'study', 'personal', 'health', 'other').default('personal'),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low').default('medium'),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'missed', 'deferred').default('pending'),
  estimatedDuration: Joi.number().min(5).max(720).default(60),
  deadline: Joi.date().iso().allow(null),
  isFixed: Joi.boolean().default(false),
  fixedStartTime: Joi.when('isFixed', {
    is: true,
    then: Joi.string().pattern(timeRegex).required().messages({
      'any.required': 'Start time is required for fixed commitments',
      'string.pattern.base': 'Start time must be in HH:MM format',
    }),
    otherwise: Joi.string().pattern(timeRegex).allow(null, ''),
  }),
  fixedEndTime: Joi.when('isFixed', {
    is: true,
    then: Joi.string().pattern(timeRegex).required().messages({
      'any.required': 'End time is required for fixed commitments',
      'string.pattern.base': 'End time must be in HH:MM format',
    }),
    otherwise: Joi.string().pattern(timeRegex).allow(null, ''),
  }),
  isRecurring: Joi.boolean().default(false),
  recurrence: Joi.object({
    frequency: Joi.string().valid('daily', 'weekly', 'monthly').default('daily'),
    daysOfWeek: Joi.array().items(Joi.number().min(0).max(6)),
    endDate: Joi.date().iso().allow(null),
  }).default(),
  tags: Joi.array().items(Joi.string().trim().max(30)).default([]),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().max(2000).allow(''),
  category: Joi.string().valid('work', 'study', 'personal', 'health', 'other'),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low'),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'missed', 'deferred'),
  estimatedDuration: Joi.number().min(5).max(720),
  deadline: Joi.date().iso().allow(null),
  isFixed: Joi.boolean(),
  fixedStartTime: Joi.string().pattern(timeRegex).allow(null, ''),
  fixedEndTime: Joi.string().pattern(timeRegex).allow(null, ''),
  isRecurring: Joi.boolean(),
  recurrence: Joi.object({
    frequency: Joi.string().valid('daily', 'weekly', 'monthly'),
    daysOfWeek: Joi.array().items(Joi.number().min(0).max(6)),
    endDate: Joi.date().iso().allow(null),
  }),
  tags: Joi.array().items(Joi.string().trim().max(30)),
}).min(1);

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'missed', 'deferred').required(),
});

const taskQuerySchema = Joi.object({
  status: Joi.string().valid('all', 'pending', 'in_progress', 'completed', 'missed', 'deferred', 'overdue'),
  category: Joi.string().valid('work', 'study', 'personal', 'health', 'other'),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low'),
  search: Joi.string().trim().allow(''),
  isFixed: Joi.boolean(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  sortBy: Joi.string().valid('deadline', 'priority', 'createdAt', 'title').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  taskQuerySchema,
};
