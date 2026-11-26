const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: ['work', 'study', 'personal', 'health', 'other'],
      default: 'personal',
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'missed', 'deferred'],
      default: 'pending',
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 60,
      min: [5, 'Duration must be at least 5 minutes'],
      max: [720, 'Duration cannot exceed 12 hours (720 min)'],
    },
    deadline: {
      type: Date,
      default: null,
    },
    isFixed: {
      type: Boolean,
      default: false, // fixed commitments (like college/exam) cannot be automatically moved by the scheduler
    },
    fixedStartTime: {
      type: String, // "09:00"
      default: null,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'],
    },
    fixedEndTime: {
      type: String, // "16:00"
      default: null,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrence: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily',
      },
      daysOfWeek: {
        type: [Number], // 0 = Sun, 1 = Mon ... 6 = Sat
        default: [],
      },
      endDate: {
        type: Date,
        default: null,
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal querying
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, deadline: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

// Virtual to determine if task is currently overdue
taskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'completed' || !this.deadline) return false;
  return new Date(this.deadline) < new Date();
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
