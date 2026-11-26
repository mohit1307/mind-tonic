const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const generateScheduleSchema = Joi.object({
  date: Joi.date().iso().default(() => new Date()),
  taskIds: Joi.array().items(Joi.string()),
  includeOverdue: Joi.boolean().default(true),
  preferences: Joi.object({
    workingHoursStart: Joi.string().pattern(timeRegex),
    workingHoursEnd: Joi.string().pattern(timeRegex),
    breakDuration: Joi.number().min(0).max(60),
    sleepStart: Joi.string().pattern(timeRegex),
    sleepEnd: Joi.string().pattern(timeRegex),
  }),
});

const blockSchema = Joi.object({
  _id: Joi.string(),
  taskId: Joi.string().allow(null),
  title: Joi.string().trim().required(),
  startTime: Joi.string().pattern(timeRegex).required(),
  endTime: Joi.string().pattern(timeRegex).required(),
  type: Joi.string().valid('fixed', 'flexible', 'break', 'sleep').default('flexible'),
  status: Joi.string().valid('scheduled', 'completed', 'missed', 'rescheduled').default('scheduled'),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low'),
  category: Joi.string().valid('study', 'work', 'personal', 'health', 'other'),
});

const updateScheduleSchema = Joi.object({
  blocks: Joi.array().items(blockSchema).required(),
});

const updateBlockSchema = Joi.object({
  title: Joi.string().trim(),
  startTime: Joi.string().pattern(timeRegex),
  endTime: Joi.string().pattern(timeRegex),
  status: Joi.string().valid('scheduled', 'completed', 'missed', 'rescheduled'),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low'),
  category: Joi.string().valid('study', 'work', 'personal', 'health', 'other'),
}).min(1);

module.exports = {
  generateScheduleSchema,
  updateScheduleSchema,
  updateBlockSchema,
};
