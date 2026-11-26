const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    topicName: {
      type: String,
      trim: true,
      default: '',
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Study session must be at least 1 minute'],
    },
    focusRating: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 4,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    date: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

studySessionSchema.index({ userId: 1, date: -1 });
studySessionSchema.index({ userId: 1, subjectId: 1 });

module.exports = mongoose.model('StudySession', studySessionSchema);
