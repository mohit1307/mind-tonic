const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema(
  {
    actionId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'create_task',
        'generate_schedule',
        'reschedule_block',
        'reschedule_missed',
        'complete_task',
        'create_habit',
        'log_habit',
        'query_data',
        'none',
      ],
      default: 'none',
    },
    parameters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['pending_confirmation', 'executed', 'rejected', 'none'],
      default: 'none',
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    action: {
      type: actionSchema,
      default: null,
    },
  },
  { _id: true }
);

const aiConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Productivity Assistant',
      trim: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

aiConversationSchema.index({ userId: 1, updatedAt: -1 });

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);

module.exports = AIConversation;
