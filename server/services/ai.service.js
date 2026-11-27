const crypto = require('crypto');
const { supabaseDb } = require('../db/supabaseDb');
const taskService = require('./task.service');
const scheduleService = require('./schedule.service');
const habitService = require('./habit.service');
const actionService = require('./action.service');
const { normalizeDate, minutesToTime, timeToMinutes } = require('../utils/timeUtils');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

function mapConvoToApi(c) {
  if (!c) return null;
  return {
    _id: c.id,
    id: c.id,
    userId: c.user_id,
    title: c.title || 'Productivity Assistant',
    messages: c.messages || [],
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

class AIService {
  /**
   * Main conversational processor
   */
  async processMessage(userId, userMessage, conversationId = null) {
    let conversation = null;
    if (conversationId) {
      conversation = await supabaseDb.findById('ai_conversations', conversationId, userId);
    }

    if (!conversation) {
      conversation = await supabaseDb.insert('ai_conversations', {
        user_id: userId,
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
      finalAction = null;
    }

    // 5. Append User message
    const messages = conversation.messages || [];
    messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    });

    // 6. Append Assistant message
    const assistantMsg = {
      role: 'assistant',
      content: finalReply,
      timestamp: new Date().toISOString(),
      action: finalAction,
    };
    messages.push(assistantMsg);

    await supabaseDb.update('ai_conversations', { id: conversation.id }, { messages });

    return {
      conversationId: conversation.id,
      message: assistantMsg,
      reply: finalReply,
    };
  }

  /**
   * Gather live context from Supabase PostgreSQL
   */
  async _gatherUserContext(userId) {
    const today = normalizeDate(new Date());

    const [prefs, schedule, taskData, habits] = await Promise.all([
      supabaseDb.findOne('user_preferences', { user_id: userId }),
      scheduleService.getScheduleByDate(userId, today),
      taskService.getTasks(userId, { status: 'pending' }),
      habitService.getHabits(userId),
    ]);

    return {
      userPreferences: {
        workingHoursStart: prefs?.working_hours_start || '09:00',
        workingHoursEnd: prefs?.working_hours_end || '22:00',
        sleepStart: prefs?.sleep_start || '23:00',
        sleepEnd: prefs?.sleep_end || '07:00',
      },
      todayBlocks: schedule?.blocks || [],
      pendingTasks: taskData?.tasks || [],
      habits: habits || [],
    };
  }

  /**
   * Interpret intent using semantic NLP engine
   */
  async _interpretIntent(message, context) {
    const cleanMsg = message.trim().toLowerCase();

    // Pattern 1: Timetable generation
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

    // Pattern 2: Reschedule / Move block
    const moveMatch = cleanMsg.match(/(?:move|reschedule|shift)\s+(.+?)\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (moveMatch) {
      const targetQuery = moveMatch[1].trim();
      const rawTargetTime = moveMatch[2].trim();

      const matchedBlock = context.todayBlocks.find(
        (b) => b.title.toLowerCase().includes(targetQuery) && b.type !== 'sleep'
      );

      const parsedStartTime = this._parseTimeTo24H(rawTargetTime);

      if (matchedBlock && parsedStartTime) {
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
              blockId: (matchedBlock.id || matchedBlock._id).toString(),
              startTime: parsedStartTime,
              endTime: newEndTime,
              title: matchedBlock.title,
            },
            status: 'pending_confirmation',
          },
        };
      }
    }

    // Pattern 2.5: Missed Task Rescheduling
    const missedMatch = cleanMsg.match(/(?:i missed|missed)\s+(.+?)(?:\.|\?|$|\s+find|\s+reschedule)/i);
    if (missedMatch || cleanMsg.includes('missed my') || cleanMsg.includes('missed task')) {
      const queryItem = missedMatch ? missedMatch[1].replace(/my\s+/i, '').trim().toLowerCase() : '';

      let targetBlock = context.todayBlocks.find(
        (b) => queryItem && b.title.toLowerCase().includes(queryItem) && b.type !== 'sleep' && b.type !== 'fixed'
      );

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
        const [sh, sm] = targetBlock.startTime.split(':').map(Number);
        const [eh, em] = targetBlock.endTime.split(':').map(Number);
        let dur = eh * 60 + em - (sh * 60 + sm);
        if (dur < 0) dur += 1440;

        return {
          reply: `I detected your missed session for "${targetBlock.title}" (${dur} mins). I can reschedule this into an available evening slot without colliding with any fixed commitments. Would you like me to reschedule it?`,
          action: {
            actionId: crypto.randomUUID(),
            type: 'reschedule_missed',
            parameters: {
              date: new Date().toISOString(),
              blockId: (targetBlock.id || targetBlock._id).toString(),
              title: targetBlock.title,
              durationMins: dur,
            },
            status: 'pending_confirmation',
          },
        };
      }
    }

    // Pattern 3: Create Task
    const createMatch =
      cleanMsg.match(/(?:add\s+(?:a\s+|the\s+)?task|create\s+(?:a\s+|the\s+)?task|new\s+task|remind\s+me\s+to|i\s+want\s+to\s+add\s+(?:a\s+|the\s+)?task|i\s+need\s+to(?:\s+add)?)\s*[:\-]?\s*(.+)/i) ||
      cleanMsg.match(/^(?:add|create)\s+(.+)/i);

    if (createMatch) {
      const fullTaskStr = createMatch[1].trim();
      const extracted = this._extractTaskDetails(fullTaskStr);

      return {
        reply: `I can add "${extracted.title}" (${extracted.duration}m, ${extracted.priority} priority) to your tasks. Shall I create it?`,
        action: {
          actionId: crypto.randomUUID(),
          type: 'create_task',
          parameters: {
            title: extracted.title,
            priority: extracted.priority,
            estimatedDuration: extracted.duration,
            category: extracted.category,
            isFixed: extracted.isFixed,
            fixedStartTime: extracted.fixedStartTime,
            fixedEndTime: extracted.fixedEndTime,
          },
          status: 'pending_confirmation',
        },
      };
    }

    // Pattern 3.5: Complete / Mark Task Done
    const doneMatch = cleanMsg.match(/(?:mark|complete|finish|done)\s+(?:task\s+)?(.+)/i);
    if (doneMatch && context.pendingTasks.length > 0) {
      const taskQuery = doneMatch[1].trim().toLowerCase();
      const matched = context.pendingTasks.find((t) => t.title.toLowerCase().includes(taskQuery));
      if (matched) {
        return {
          reply: `I found "${matched.title}". Would you like me to mark it as completed?`,
          action: {
            actionId: crypto.randomUUID(),
            type: 'complete_task',
            parameters: {
              taskId: (matched.id || matched._id).toString(),
              title: matched.title,
            },
            status: 'pending_confirmation',
          },
        };
      }
    }

    // Pattern 4: Query queries (e.g., "What tasks are pending?", "How many hours did I study?")
    if (
      cleanMsg.includes('pending task') ||
      cleanMsg.includes('tasks pending') ||
      cleanMsg.includes('study hours') ||
      cleanMsg.includes('hours did i study') ||
      cleanMsg.includes('my habits')
    ) {
      return {
        reply: '',
        action: {
          type: 'query_data',
          parameters: { query: cleanMsg },
        },
      };
    }

    // Pattern 5: Manage Routine / Day assistance
    if (cleanMsg.includes('manage') || cleanMsg.includes('what should i do') || cleanMsg.includes('help me')) {
      const pendingCount = context.pendingTasks.length;
      const todayBlocksCount = context.todayBlocks.length;
      return {
        reply: `You currently have ${pendingCount} pending task${pendingCount === 1 ? '' : 's'} and ${todayBlocksCount} timetable block${todayBlocksCount === 1 ? '' : 's'} scheduled for today.\n\nYou can ask me to:\n• "Add task [name] for [duration]"\n• "Create my timetable for today"\n• "Reschedule my [session] to [time]"\n• "What tasks are pending?"\n\nWhat would you like me to organize for you right now?`,
        action: null,
      };
    }

    // Default conversational response
    return {
      reply: `I'm here to help you manage your college routine, timetable, study sessions, habits, and expenses. You can ask me to "Create my timetable for tomorrow", "Add task Study Java for 2 hours", or "I missed my workout, find another slot".`,
      action: null,
    };
  }

  /**
   * Read-only data queries
   */
  async _executeQuery(userId, params, context) {
    const q = params.query;
    if (q.includes('task')) {
      const pending = context.pendingTasks;
      if (pending.length === 0) {
        return { reply: "You don't have any pending tasks right now. Great job keeping up!" };
      }
      const list = pending.slice(0, 5).map((t) => `• ${t.title} (${t.priority})`).join('\n');
      return { reply: `Here are your pending tasks:\n${list}\n${pending.length > 5 ? `...and ${pending.length - 5} more.` : ''}` };
    }

    if (q.includes('habit')) {
      const habits = context.habits;
      if (habits.length === 0) {
        return { reply: "You haven't set up any habits yet. You can create one in the Habit Tracker!" };
      }
      const list = habits.map((h) => `• ${h.name} (${h.currentStreak || 0}-day streak)`).join('\n');
      return { reply: `Here are your active habits:\n${list}` };
    }

    return { reply: `You have ${context.pendingTasks.length} pending tasks and ${context.todayBlocks.length} timetable events today.` };
  }

  _parseTimeTo24H(timeStr) {
    const clean = timeStr.toLowerCase().trim();
    const isPM = clean.includes('pm');
    const isAM = clean.includes('am');
    const numPart = clean.replace(/[ap]m/, '').trim();
    let [hours, mins] = numPart.split(':').map(Number);
    if (isNaN(mins)) mins = 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  _extractTaskDetails(str) {
    let title = str;
    let duration = 60;
    let priority = 'medium';
    let category = 'study';
    let isFixed = false;
    let fixedStartTime = null;
    let fixedEndTime = null;

    if (str.includes('urgent') || str.includes('critical')) priority = 'urgent';
    else if (str.includes('high priority') || str.includes('priority high')) priority = 'high';
    else if (str.includes('low priority') || str.includes('priority low')) priority = 'low';

    const durMatch = str.match(/for\s+(\d+)\s*(hour|hr|minute|min)s?/i);
    if (durMatch) {
      const val = parseInt(durMatch[1], 10);
      const unit = durMatch[2].toLowerCase();
      duration = unit.startsWith('h') ? val * 60 : val;
      title = title.replace(durMatch[0], '').trim();
    }

    // Clean up title from common prefixes and priority flags
    title = title.replace(/^(?:a\s+|the\s+)?task\s*[:\-]?\s*/i, '').trim();
    title = title.replace(/\b(?:urgent|critical|high priority|low priority|medium priority)\b/gi, '').trim();
    if (!title) title = 'New Task';

    const collegeMatch = str.match(/(?:college|lecture|lab)\s+from\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s+to\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (collegeMatch) {
      isFixed = true;
      category = 'college';
      fixedStartTime = this._parseTimeTo24H(collegeMatch[1]);
      fixedEndTime = this._parseTimeTo24H(collegeMatch[2]);
    }

    return { title, duration, priority, category, isFixed, fixedStartTime, fixedEndTime };
  }

  /**
   * Execute a user-confirmed action
   */
  async confirmAction(userId, actionId) {
    const convosResult = await supabaseDb.findMany('ai_conversations', { user_id: userId });
    const convos = convosResult.data || [];

    let targetConvo = null;
    let targetAction = null;

    for (const c of convos) {
      for (const m of c.messages || []) {
        if (m.action && m.action.actionId === actionId) {
          targetConvo = c;
          targetAction = m.action;
          break;
        }
      }
      if (targetAction) break;
    }

    if (!targetAction) throw ApiError.notFound('Action proposal not found');
    if (targetAction.status !== 'pending_confirmation') {
      throw ApiError.badRequest(`Action is already ${targetAction.status}`);
    }

    const executionResult = await actionService.execute(userId, targetAction);
    targetAction.status = 'executed';
    targetAction.result = executionResult;

    await supabaseDb.update('ai_conversations', { id: targetConvo.id }, { messages: targetConvo.messages });

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
    const convosResult = await supabaseDb.findMany('ai_conversations', { user_id: userId });
    const convos = convosResult.data || [];

    let targetConvo = null;
    let targetAction = null;

    for (const c of convos) {
      for (const m of c.messages || []) {
        if (m.action && m.action.actionId === actionId) {
          targetConvo = c;
          targetAction = m.action;
          break;
        }
      }
      if (targetAction) break;
    }

    if (!targetAction) throw ApiError.notFound('Action not found');

    targetAction.status = 'rejected';
    await supabaseDb.update('ai_conversations', { id: targetConvo.id }, { messages: targetConvo.messages });

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
    const convosResult = await supabaseDb.findMany(
      'ai_conversations',
      { user_id: userId },
      { orderBy: 'updated_at', ascending: false }
    );
    const convos = convosResult.data || [];
    return convos.map(mapConvoToApi);
  }

  /**
   * Get single conversation with full message history
   */
  async getConversation(userId, conversationId) {
    const convo = await supabaseDb.findById('ai_conversations', conversationId, userId);
    if (!convo) throw ApiError.notFound('Conversation not found');
    return mapConvoToApi(convo);
  }

  /**
   * Delete conversation
   */
  async deleteConversation(userId, conversationId) {
    const convo = await supabaseDb.findById('ai_conversations', conversationId, userId);
    if (!convo) throw ApiError.notFound('Conversation not found');

    await supabaseDb.delete('ai_conversations', { id: conversationId, user_id: userId });
    return { message: 'Conversation deleted successfully' };
  }
}

module.exports = new AIService();
