const mongoose = require('mongoose');

const scheduleBlockSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'],
    },
    type: {
      type: String,
      enum: ['fixed', 'flexible', 'break', 'sleep'],
      default: 'flexible',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'missed', 'rescheduled'],
      default: 'scheduled',
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: ['study', 'work', 'personal', 'health', 'other'],
      default: 'personal',
    },
  },
  { _id: true }
);

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true, // Normalized to midnight UTC
    },
    blocks: {
      type: [scheduleBlockSchema],
      default: [],
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: One schedule per user per calendar day
scheduleSchema.index({ userId: 1, date: 1 }, { unique: true });

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
