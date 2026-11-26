const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      maxlength: 120,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['academic', 'receipt', 'identity', 'notes', 'fee_challan', 'other'],
      default: 'other',
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    ocrStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'not_applicable'],
      default: 'pending',
    },
    ocrText: {
      type: String,
      default: '',
    },
    ocrData: {
      amount: { type: Number, default: null },
      currency: { type: String, default: 'INR' },
      vendor: { type: String, default: '' },
      date: { type: Date, default: null },
      detectedCategory: { type: String, default: '' },
      confidence: { type: Number, default: 0 },
      lineItems: [{ type: String }],
    },
    isLinkedToExpense: {
      type: Boolean,
      default: false,
    },
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
