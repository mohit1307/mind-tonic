const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    // SM-2 Spaced Repetition fields
    repetitions: {
      type: Number,
      default: 0,
      min: 0,
    },
    interval: {
      type: Number,
      default: 1, // in days
      min: 1,
    },
    easinessFactor: {
      type: Number,
      default: 2.5,
      min: 1.3,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    nextReviewDate: {
      type: Date,
      default: () => new Date(),
    },
  },
  { _id: true, timestamps: true }
);

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: [80, 'Subject name cannot exceed 80 characters'],
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 20,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    icon: {
      type: String,
      default: 'BookOpen',
    },
    targetHours: {
      type: Number,
      default: 20,
      min: 0,
    },
    totalStudyMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    topics: [topicSchema],
  },
  {
    timestamps: true,
  }
);

subjectSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
