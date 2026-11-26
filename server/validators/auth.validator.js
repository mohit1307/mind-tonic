const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  avatar: Joi.string().allow(''),
  preferences: Joi.object({
    timezone: Joi.string(),
    workingHoursStart: Joi.string().pattern(timeRegex).message('workingHoursStart must be HH:MM format'),
    workingHoursEnd: Joi.string().pattern(timeRegex).message('workingHoursEnd must be HH:MM format'),
    breakDuration: Joi.number().min(5).max(60),
    sleepStart: Joi.string().pattern(timeRegex).message('sleepStart must be HH:MM format'),
    sleepEnd: Joi.string().pattern(timeRegex).message('sleepEnd must be HH:MM format'),
    notificationsEnabled: Joi.boolean(),
    reminderDefaults: Joi.object({
      beforeDeadline: Joi.array().items(Joi.number().min(1)),
    }),
    theme: Joi.string().valid('dark', 'light'),
  }),
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string().min(6).max(128).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  changePasswordSchema,
};
