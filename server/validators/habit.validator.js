const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createHabitSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Habit name is required',
    'string.min': 'Habit name must be at least 2 characters',
    'any.required': 'Habit name is required',
  }),
  description: Joi.string().trim().max(500).allow(''),
  frequency: Joi.string().valid('daily', 'weekly').default('daily'),
  targetDaysPerWeek: Joi.number().min(1).max(7).default(7),
  reminderTime: Joi.string().pattern(timeRegex).allow(null, ''),
  color: Joi.string().trim().default('#8b5cf6'),
  icon: Joi.string().trim().default('Target'),
});

const updateHabitSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().max(500).allow(''),
  frequency: Joi.string().valid('daily', 'weekly'),
  targetDaysPerWeek: Joi.number().min(1).max(7),
  reminderTime: Joi.string().pattern(timeRegex).allow(null, ''),
  color: Joi.string().trim(),
  icon: Joi.string().trim(),
  isActive: Joi.boolean(),
}).min(1);

const toggleLogSchema = Joi.object({
  date: Joi.date().iso().default(() => new Date()),
  notes: Joi.string().trim().max(500).allow(''),
});

module.exports = {
  createHabitSchema,
  updateHabitSchema,
  toggleLogSchema,
};
