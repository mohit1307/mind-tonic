const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: 120,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      enum: [
        'college_fee',
        'books_stationery',
        'food',
        'transport',
        'housing_rent',
        'utilities',
        'entertainment',
        'personal',
        'other',
      ],
      default: 'personal',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'credit_card', 'debit_card', 'cash', 'net_banking', 'other'],
      default: 'upi',
    },
    date: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
    isCollegeFee: {
      type: Boolean,
      default: false,
      index: true,
    },
    feeDetails: {
      semester: { type: String, default: '' },
      academicYear: { type: String, default: '' },
      receiptNumber: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'due_soon'],
      default: 'paid',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceInterval: {
      type: String,
      enum: ['none', 'monthly', 'semester', 'annual'],
      default: 'none',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, isCollegeFee: 1 });
expenseSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
