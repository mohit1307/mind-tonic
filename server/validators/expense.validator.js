const Joi = require('joi');

const createExpenseSchema = Joi.object({
  title: Joi.string().trim().max(120).required().messages({
    'string.empty': 'Expense title is required',
    'any.required': 'Expense title is required',
  }),
  amount: Joi.number().min(0.01).required().messages({
    'number.min': 'Amount must be greater than zero',
    'any.required': 'Amount is required',
  }),
  category: Joi.string()
    .valid(
      'college_fee',
      'books_stationery',
      'food',
      'transport',
      'housing_rent',
      'utilities',
      'entertainment',
      'personal',
      'other'
    )
    .default('personal'),
  paymentMethod: Joi.string()
    .valid('upi', 'credit_card', 'debit_card', 'cash', 'net_banking', 'other')
    .default('upi'),
  date: Joi.date().iso().default(() => new Date()),
  isCollegeFee: Joi.boolean().default(false),
  feeDetails: Joi.object({
    semester: Joi.string().trim().allow('').default(''),
    academicYear: Joi.string().trim().allow('').default(''),
    receiptNumber: Joi.string().trim().allow('').default(''),
  }).default({}),
  status: Joi.string().valid('paid', 'pending', 'due_soon').default('paid'),
  dueDate: Joi.date().iso().allow(null).default(null),
  documentId: Joi.string().hex().length(24).allow(null, '').default(null),
  isRecurring: Joi.boolean().default(false),
  recurrenceInterval: Joi.string()
    .valid('none', 'monthly', 'semester', 'annual')
    .default('none'),
  notes: Joi.string().trim().max(500).allow('').default(''),
});

const updateExpenseSchema = Joi.object({
  title: Joi.string().trim().max(120),
  amount: Joi.number().min(0.01),
  category: Joi.string().valid(
    'college_fee',
    'books_stationery',
    'food',
    'transport',
    'housing_rent',
    'utilities',
    'entertainment',
    'personal',
    'other'
  ),
  paymentMethod: Joi.string().valid(
    'upi',
    'credit_card',
    'debit_card',
    'cash',
    'net_banking',
    'other'
  ),
  date: Joi.date().iso(),
  isCollegeFee: Joi.boolean(),
  feeDetails: Joi.object({
    semester: Joi.string().trim().allow(''),
    academicYear: Joi.string().trim().allow(''),
    receiptNumber: Joi.string().trim().allow(''),
  }),
  status: Joi.string().valid('paid', 'pending', 'due_soon'),
  dueDate: Joi.date().iso().allow(null),
  documentId: Joi.string().hex().length(24).allow(null, ''),
  isRecurring: Joi.boolean(),
  recurrenceInterval: Joi.string().valid('none', 'monthly', 'semester', 'annual'),
  notes: Joi.string().trim().max(500).allow(''),
}).min(1);

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
};
