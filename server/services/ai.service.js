const crypto = require('crypto');
const AIConversation = require('../models/AIConversation');
const User = require('../models/User');
const Task = require('../models/Task');
const Schedule = require('../models/Schedule');
const Habit = require('../models/Habit');
const actionService = require('./action.service');
const { normalizeDate, minutesToTime, timeToMinutes } = require('../utils/timeUtils');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

class AIService {
  /**
   * Main conversational processor
   */
  async processMessage(userId, userMessage, conversationId = null) {
    // 1. Fetch or create AI conversation record
    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, userId });
    }
    if (!conversation) {
      conversation = await AIConversation.create({
        userId,
        title: userMessage.slice(0, 40) + '...',
        messages: [],
      });
    }

    // 2. Fetch User Context for accurate understanding
    const context = await this._gatherUserContext(userId);

    // 3. Process Natural Language Intent
    const { reply, action } = await this._interpretIntent(userMessage, context);

    // 4. Handle Read-Only queries immediately
    let finalReply = reply;
    let finalAction = action;

    if (action && action.type === 'query_data') {
      const queryResult = await this._executeQuery(userId, action.parameters, context);
      finalReply = queryResult.reply;
      finalAction = null; // No write action card needed
    }

    // 5. Append User message
    conversation.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // 6. Append Assistant message with structured action (if any)
    const assistantMsg = {
      role: 'assistant',
      content: finalReply,
      timestamp: new Date(),
      action: finalAction,
    };
    conversation.messages.push(assistantMsg);

    await conversation.save();

    return {
      conversationId: conversation._id,
      message: assistantMsg,
    };
  }

  /**
   * Gather live context from MongoDB
   */
  async _gatherUserContext(userId) {
    const today = normalizeDate(new Date());

    const [user, schedule, pendingTasks, habits] = await Promise.all([
      User.findById(userId),
      Schedule.findOne({ userId, date: today }),
      Task.find({ userId, status: { $in: ['pending', 'in_progress'] } }),
      Habit.find({ userId, isActive: true }),
    ]);

    return {
      userPreferences: user?.preferences || {},
      todayBlocks: schedule?.blocks || [],
      pendingTasks: pendingTasks || [],
      habits: habits || [],
    };
  }

  /**
   * Interpret intent using Gemini/OpenAI API or rule-based semantic NLP engine
   */
  async _interpretIntent(message, context) {
    const cleanMsg = message.trim().toLowerCase();

    // ── Pattern 1: Timetable generation (e.g. "Create my timetable", "Generate routine") ──
    if (
      cleanMsg.includes('timetable') ||
      cleanMsg.includes('generate schedule') ||
      cleanMsg.includes('create my schedule') ||
      cleanMsg.includes('create routine') ||
      cleanMsg.includes('organize my day')
    ) {
      return {
        reply: `I can optimize and generate your daily timetable based on your ${context.pendingTasks.length} pending tasks, fixed commitments, and working hours (${context.userPreferences.workingHoursStart || '09:00'} - ${context.userPreferences.workingHoursEnd || '22:00'}). Would you like me to generate it?`,
        action: {
          actionId: crypto.randomUUID(),
          type: 'generate_schedule',
          parameters: {
            date: new Date().toISOString(),
          },
          status: 'pending_confirmation',
        },
      };
    }

    // ── Pattern 2: Reschedule / Move block (e.g. "Move my Java session to 7 PM") ──
    const moveMatch = cleanMsg.match(/(?:move|reschedule|shift)\s+(.+?)\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (moveMatch) {
      const targetQuery = moveMatch[1].trim();
      const rawTargetTime = moveMatch[2].trim();

      // Find matching block in today's schedule
      const matchedBlock = context.todayBlocks.find(
        (b) => b.title.toLowerCase().includes(targetQuery) && b.type !== 'sleep'
      );

      const parsedStartTime = this._parseTimeTo24H(rawTargetTime);

      if (matchedBlock && parsedStartTime) {
        // Compute duration
        const [sh, sm] = matchedBlock.startTime.split(':').map(Number);
        const [eh, em] = matchedBlock.endTime.split(':').map(Number);
        let dur = eh * 60 + em - (sh * 60 + sm);
        if (dur < 0) dur += 1440;

        const newStartMins = timeToMinutes(parsedStartTime);
        const newEndMins = newStartMins + dur;
        const newEndTime = minutesToTime(newEndMins);

        return {
          reply: `I found "${matchedBlock.title}". I can move it from ${matchedBlock.startTime} to ${parsedStartTime} - ${newEndTime}. Confirm to update your timetable.`,
          action: {
            actionId: crypto.randomUUID(),
            type: 'reschedule_block',
            parameters: {
              date: new Date().toISOString(),
              blockId: matchedBlock._id.toString(),
              startTime: parsedStartTime,
              endTime: newEndTime,
              title: matchedBlock.title,
            },
            status: 'pending_confirmation',
          },
        };
      }
    }

    // ── Pattern 2.5: Missed Task Rescheduling (e.g. "I missed my workout. Find another time", "Missed Java session") ──
    const missedMatch = cleanMsg.match(/(?:i missed|missed)\s+(.+?)(?:\.|\?|$|\s+find|\s+reschedule)/i);
    if (missedMatch || cleanMsg.includes('missed my') || cleanMsg.includes('missed task')) {
      const queryItem = missedMatch ? missedMatch[1].replace(/my\s+/i, '').trim().toLowerCase() : '';

      // Find in today's blocks
      let targetBlock = context.todayBlocks.find(
        (b) => queryItem && b.title.toLowerCase().includes(queryItem) && b.type !== 'sleep' && b.type !== 'fixed'
      );

      // If not directly matched by query string, check for any block marked 'missed' or past its end time
      if (!targetBlock) {
        const now = new Date();
        const curMins = now.getHours() * 60 + now.getMinutes();
        targetBlock = context.todayBlocks.find(
          (b) =>
            (b.status === 'missed' || (b.status === 'scheduled' && timeToMinutes(b.endTime) < curMins)) &&
            b.type !== 'sleep' &&
            b.type !== 'fixed'
        );
      }

      if (targetBlock) {
        // Calculate duration
        const [sh, sm] = targetBlock.startTime.split(':').map(Number);
        const [eh, em] = targetBlock.endTime.split(':').map(Number);
        let dur = eh * 60 + em - (sh * 60 + sm);
        if (dur < 0) dur += 1440;

        const now = new Date();
        const curTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const schedulerEngine = require('../engines/scheduler');
        const suggestions = schedulerEngine.findMultipleAlternativeSlots({
          blocks: context.todayBlocks,
          preferences: context.userPreferences,
          durationMins: dur,
          fromTimeStr: curTimeStr,
          excludeBlockId: targetBlock._id,
          limit: 1,
        });

        if (suggestions.length > 0) {
          const slot = suggestions[0];
          return {
            reply: `I understand you missed "${targetBlock.title}". I checked your remaining available time and found an open slot from ${slot.startTime} to ${slot.endTime} (${dur}m). Would you like to reschedule it?`,
            action: {
              actionId: crypto.randomUUID(),
              type: 'reschedule_missed',
              parameters: {
                date: new Date().toISOString(),
                blockId: targetBlock._id.toString(),
                newStartTime: slot.startTime,
                newEndTime: slot.endTime,
                title: targetBlock.title,
                durationMins: dur,
              },
              status: 'pending_confirmation',
            },
          };
        } else {
          return {
            reply: `I noticed you missed "${targetBlock.title}", but there are no remaining free slots within your preferred hours today without conflicting with fixed commitments or sleep. Would you like me to move it to tomorrow?`,
            action: null,
          };
        }
      }
    }

    // ── Pattern 3: Create Task (e.g. "Add task: Study Java for 2 hours", "New task: Gym") ──
    if (
      cleanMsg.startsWith('add task') ||
      cleanMsg.startsWith('new task') ||
      cleanMsg.startsWith('create task') ||
      cleanMsg.includes('remind me to') ||
      cleanMsg.includes('i need to')
    ) {
      let rawTask = message.replace(/^(?:add task|new task|create task|remind me to|i need to)[:\s]*/i, '').trim();

      // Duration parsing (e.g. "for 2 hours", "for 45 minutes", "for 1 hour")
      let duration = 60;
      const durMatch = rawTask.match(/\bfor\s+(\d+(?:\.\d+)?)\s*(hours?|hrs?|mins?|minutes?)\b/i);
      if (durMatch) {
        const val = parseFloat(durMatch[1]);
        const unit = durMatch[2].toLowerCase();
        duration = unit.startsWith('h') ? Math.round(val * 60) : Math.round(val);
        rawTask = rawTask.replace(durMatch[0], '').trim();
      }

      // Priority detection
      let priority = 'medium';
      if (/urgent|critical|asap|important/i.test(message)) priority = 'high';

      // Category detection
      let category = 'personal';
      if (/study|java|code|reading|exam|class|learn/i.test(rawTask)) category = 'study';
      else if (/work|project|meeting|client|report/i.test(rawTask)) category = 'work';
      else if (/gym|workout|exercise|run|walk|health/i.test(rawTask)) category = 'health';

      return {
        reply: `I can create the task "${rawTask}" with a duration of ${duration} minutes (${priority} priority). Would you like me to save it?`,
        action: {
          actionId: crypto.randomUUID(),
          type: 'create_task',
          parameters: {
            title: rawTask,
            estimatedDuration: duration,
            priority,
            category,
          },
          status: 'pending_confirmation',
        },
      };
    }

    // ── Pattern 4: Query pending tasks (e.g. "What tasks are pending today?", "List pending tasks") ──
    if (cleanMsg.includes('pending') || cleanMsg.includes('what tasks') || cleanMsg.includes('my tasks')) {
      return {
        reply: '',
        action: {
          type: 'query_data',
          parameters: { queryType: 'pending_tasks' },
        },
      };
    }

    // ── Pattern 5: Query habits (e.g. "How are my habits doing?", "Habit streak") ──
    if (cleanMsg.includes('habit') || cleanMsg.includes('streak')) {
      return {
        reply: '',
        action: {
          type: 'query_data',
          parameters: { queryType: 'habits' },
        },
      };
    }

    // ── Pattern 6: Create Habit (e.g. "Create habit: Read 20 mins") ──
    if (cleanMsg.startsWith('create habit') || cleanMsg.startsWith('add habit') || cleanMsg.startsWith('new habit')) {
      const habitName = message.replace(/^(?:create habit|add habit|new habit)[:\s]*/i, '').trim();
      return {
        reply: `I can register "${habitName}" as a new daily habit with automated streak tracking. Confirm below:`,
        action: {
          actionId: crypto.randomUUID(),
          type: 'create_habit',
          parameters: {
            name: habitName,
            frequency: 'daily',
            color: '#8b5cf6',
            icon: 'Target',
          },
          status: 'pending_confirmation',
        },
      };
    }

    // Default Conversational Assistant Reply
    return {
      reply: `I can assist with your schedule, tasks, habits, and study plan. You can tell me:\n\n• "Create my timetable for today"\n• "Add task: Study Java concurrency for 2 hours"\n• "Move my Java session to 7 PM"\n• "What tasks are pending today?"\n• "How are my habit streaks?"`,
      action: null,
    };
  }

  /**
   * Parse colloquial time e.g. "7 PM", "7:30 PM", "19:00", "7pm" to "19:00"
   */
  _parseTimeTo24H(timeStr) {
    const match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const ampm = match[3] ? match[3].toLowerCase() : null;

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  /**
   * Execute read-only queries with enriched contextual replies
   */
  async _executeQuery(userId, params, context) {
    if (params.queryType === 'pending_tasks') {
      const pending = context.pendingTasks;
      if (pending.length === 0) {
        return { reply: "You don't have any pending tasks right now! Everything is completed or on schedule." };
      }
      const list = pending.map((t, i) => `${i + 1}. **${t.title}** (${t.estimatedDuration}m, ${t.priority} priority)`).join('\n');
      return {
        reply: `You currently have **${pending.length} pending task${pending.length === 1 ? '' : 's'}**:\n\n${list}`,
      };
    }

    if (params.queryType === 'habits') {
      const habits = context.habits;
      if (habits.length === 0) {
        return { reply: "You haven't added any habits yet. Say 'Add habit: Drink 3L water' to get started!" };
      }
      const list = habits.map((h) => `• **${h.name}**: 🔥 ${h.currentStreak} day streak (Best: ${h.longestStreak} days)`).join('\n');
      return {
        reply: `Here is your current habit performance:\n\n${list}`,
      };
    }

    return { reply: 'Information retrieved.' };
  }

  /**
   * Confirm and execute a pending action
   */
  async confirmAction(userId, actionId) {
    const conversation = await AIConversation.findOne({
      userId,
      'messages.action.actionId': actionId,
    });

    if (!conversation) {
      throw ApiError.notFound('Action not found or already processed');
    }

    let targetAction = null;
    let targetMessage = null;

    for (const msg of conversation.messages) {
      if (msg.action && msg.action.actionId === actionId) {
        targetAction = msg.action;
        targetMessage = msg;
        break;
      }
    }

    if (!targetAction || targetAction.status !== 'pending_confirmation') {
      throw ApiError.badRequest('Action is not in a confirmable state');
    }

    // Execute through deterministic action service
    const executionResult = await actionService.execute(userId, targetAction);

    // Update action status
    targetAction.status = 'executed';
    targetAction.result = executionResult;

    await conversation.save();

    return {
      actionId,
      status: 'executed',
      message: executionResult.message,
      result: executionResult,
    };
  }

  /**
   * Reject / Cancel a pending action
   */
  async rejectAction(userId, actionId) {
    const conversation = await AIConversation.findOne({
      userId,
      'messages.action.actionId': actionId,
    });

    if (!conversation) {
      throw ApiError.notFound('Action not found');
    }

    for (const msg of conversation.messages) {
      if (msg.action && msg.action.actionId === actionId) {
        msg.action.status = 'rejected';
        break;
      }
    }

    await conversation.save();

    return {
      actionId,
      status: 'rejected',
      message: 'Action was cancelled.',
    };
  }

  /**
   * List past conversations
   */
  async getConversations(userId) {
    return await AIConversation.find({ userId })
      .select('title updatedAt createdAt')
      .sort({ updatedAt: -1 });
  }

  /**
   * Get single conversation with full message history
   */
  async getConversation(userId, conversationId) {
    const conversation = await AIConversation.findOne({ _id: conversationId, userId });
    if (!conversation) throw ApiError.notFound('Conversation not found');
    return conversation;
  }

  /**
   * Delete conversation
   */
  async deleteConversation(userId, conversationId) {
    const result = await AIConversation.findOneAndDelete({ _id: conversationId, userId });
    if (!result) throw ApiError.notFound('Conversation not found');
    return result;
  }
}

module.exports = new AIService();
