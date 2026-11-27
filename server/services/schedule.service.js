const { supabaseDb } = require('../db/supabaseDb');
const taskService = require('./task.service');
const schedulerEngine = require('../engines/scheduler');
const { normalizeDate, timeToMinutes, minutesToTime } = require('../utils/timeUtils');
const ApiError = require('../utils/apiError');

function mapEventToBlock(e) {
  if (!e) return null;
  return {
    _id: e.id,
    id: e.id,
    taskId: e.task_id || null,
    title: e.title,
    startTime: e.start_time,
    endTime: e.end_time,
    type: e.type || 'flexible',
    status: e.status || 'scheduled',
    priority: e.priority || 'medium',
    category: e.category || 'study',
    notes: e.notes || '',
  };
}

function mapBlockToEvent(b, scheduleId, userId) {
  return {
    schedule_id: scheduleId,
    task_id: b.taskId || null,
    user_id: userId,
    title: b.title,
    start_time: b.startTime,
    end_time: b.endTime,
    type: b.type || 'flexible',
    status: b.status || 'scheduled',
    priority: b.priority || 'medium',
    category: b.category || 'study',
    notes: b.notes || '',
  };
}

class ScheduleService {
  /**
   * Get schedule for a specific date
   */
  async getScheduleByDate(userId, dateInput) {
    const targetDate = normalizeDate(dateInput || new Date());
    const dateStr = targetDate.toISOString().split('T')[0];

    const schedule = await supabaseDb.findOne('schedules', {
      user_id: userId,
      date: dateStr,
    });

    if (!schedule) {
      return {
        date: targetDate,
        blocks: [],
        aiGenerated: false,
        isDraft: true,
      };
    }

    const { data: events } = await supabaseDb.client
      .from('schedule_events')
      .select('*')
      .eq('schedule_id', schedule.id)
      .order('start_time', { ascending: true });

    const blocks = (events || []).map(mapEventToBlock);

    return {
      _id: schedule.id,
      id: schedule.id,
      userId: schedule.user_id,
      date: targetDate,
      totalFocusMinutes: schedule.total_focus_minutes || 0,
      completedMinutes: schedule.completed_minutes || 0,
      isDraft: schedule.is_draft,
      blocks,
    };
  }

  /**
   * Generate an optimized timetable using the 288-slot scheduling engine
   */
  async generateSchedule(userId, { date, taskIds, includeOverdue = true, preferences = {} } = {}) {
    const targetDate = normalizeDate(date || new Date());
    const dateStr = targetDate.toISOString().split('T')[0];

    // 1. Fetch user preferences
    const dbPrefs = await supabaseDb.findOne('user_preferences', { user_id: userId });
    const combinedPreferences = {
      workingHoursStart: dbPrefs?.working_hours_start || '09:00',
      workingHoursEnd: dbPrefs?.working_hours_end || '18:00',
      sleepStart: dbPrefs?.sleep_start || '23:00',
      sleepEnd: dbPrefs?.sleep_end || '07:00',
      breakDuration: dbPrefs?.break_duration || 15,
      ...preferences,
    };

    // 2. Fetch applicable tasks
    let taskList = [];
    if (taskIds && taskIds.length > 0) {
      const { data } = await supabaseDb.client
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .in('id', taskIds);
      taskList = data || [];
    } else {
      let q = supabaseDb.client
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .or('status.in.(pending,in_progress),is_fixed.eq.true');

      if (!includeOverdue) {
        q = q.gte('deadline', new Date().toISOString());
      }
      const { data } = await q;
      taskList = data || [];
    }

    // Adapt tasks to format expected by scheduler engine
    const engineTasks = taskList.map((t) => ({
      _id: t.id,
      id: t.id,
      title: t.title,
      category: t.category,
      priority: t.priority,
      isFixed: t.is_fixed,
      fixedStartTime: t.fixed_start_time,
      fixedEndTime: t.fixed_end_time,
      estimatedDuration: t.estimated_duration,
      deadline: t.deadline,
    }));

    // 3. Run deterministic 288-slot scheduling algorithm
    const generatedBlocks = schedulerEngine.generateDailySchedule({
      tasks: engineTasks,
      preferences: combinedPreferences,
      targetDate,
    });

    // 4. Upsert schedule in Supabase PostgreSQL
    let schedule = await supabaseDb.findOne('schedules', {
      user_id: userId,
      date: dateStr,
    });

    if (!schedule) {
      schedule = await supabaseDb.insert('schedules', {
        user_id: userId,
        date: dateStr,
        is_draft: false,
      });
    }

    // 5. Replace existing schedule events
    await supabaseDb.delete('schedule_events', { schedule_id: schedule.id });

    if (generatedBlocks.length > 0) {
      const eventRows = generatedBlocks.map((b) => mapBlockToEvent(b, schedule.id, userId));
      await supabaseDb.insert('schedule_events', eventRows);
    }

    return this.getScheduleByDate(userId, targetDate);
  }

  /**
   * Update full schedule blocks for a date
   */
  async updateSchedule(userId, dateInput, blocks) {
    const targetDate = normalizeDate(dateInput);
    const dateStr = targetDate.toISOString().split('T')[0];

    let schedule = await supabaseDb.findOne('schedules', {
      user_id: userId,
      date: dateStr,
    });

    if (!schedule) {
      schedule = await supabaseDb.insert('schedules', {
        user_id: userId,
        date: dateStr,
        is_draft: false,
      });
    }

    // Replace schedule_events
    await supabaseDb.delete('schedule_events', { schedule_id: schedule.id });

    if (blocks && blocks.length > 0) {
      const eventRows = blocks.map((b) => mapBlockToEvent(b, schedule.id, userId));
      await supabaseDb.insert('schedule_events', eventRows);
    }

    return this.getScheduleByDate(userId, targetDate);
  }

  /**
   * Update single block inside a schedule
   */
  async updateBlock(userId, dateInput, blockId, updates) {
    const targetDate = normalizeDate(dateInput);
    const dateStr = targetDate.toISOString().split('T')[0];

    const schedule = await supabaseDb.findOne('schedules', {
      user_id: userId,
      date: dateStr,
    });

    if (!schedule) throw ApiError.notFound('Schedule not found for this date');

    const event = await supabaseDb.findById('schedule_events', blockId, userId);
    if (!event || event.schedule_id !== schedule.id) {
      throw ApiError.notFound('Schedule block not found');
    }

    const eventUpdates = {};
    if (updates.title !== undefined) eventUpdates.title = updates.title;
    if (updates.startTime !== undefined) eventUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) eventUpdates.end_time = updates.endTime;
    if (updates.status !== undefined) eventUpdates.status = updates.status;
    if (updates.priority !== undefined) eventUpdates.priority = updates.priority;
    if (updates.category !== undefined) eventUpdates.category = updates.category;
    if (updates.notes !== undefined) eventUpdates.notes = updates.notes;

    await supabaseDb.update('schedule_events', { id: blockId }, eventUpdates);

    // If linked to task and status completed, update task status as well
    if (event.task_id && updates.status) {
      if (updates.status === 'completed') {
        await taskService.updateStatus(userId, event.task_id, 'completed');
      } else if (updates.status === 'scheduled') {
        await taskService.updateStatus(userId, event.task_id, 'pending');
      }
    }

    return this.getScheduleByDate(userId, targetDate);
  }

  /**
   * Delete a single block from a schedule
   */
  async deleteBlock(userId, dateInput, blockId) {
    const targetDate = normalizeDate(dateInput);
    const dateStr = targetDate.toISOString().split('T')[0];

    const schedule = await supabaseDb.findOne('schedules', {
      user_id: userId,
      date: dateStr,
    });

    if (!schedule) throw ApiError.notFound('Schedule not found for this date');

    await supabaseDb.delete('schedule_events', { id: blockId, user_id: userId });
    return this.getScheduleByDate(userId, targetDate);
  }

  /**
   * Get 7-day schedule view starting from given date
   */
  async getWeekSchedule(userId, startDateInput) {
    const start = normalizeDate(startDateInput || new Date());
    const weekSchedules = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const daySchedule = await this.getScheduleByDate(userId, d);
      weekSchedules.push(daySchedule);
    }

    return weekSchedules;
  }

  /**
   * Detect any missed tasks whose scheduled time window has passed
   */
  async detectMissedBlocks(userId, dateInput = new Date(), currentTimeStr = null) {
    const targetDate = normalizeDate(dateInput);
    const schedule = await this.getScheduleByDate(userId, targetDate);

    if (!schedule || !schedule.blocks || schedule.blocks.length === 0) {
      return { missedBlocks: [] };
    }

    const dbPrefs = await supabaseDb.findOne('user_preferences', { user_id: userId });
    const preferences = {
      workingHoursStart: dbPrefs?.working_hours_start || '09:00',
      workingHoursEnd: dbPrefs?.working_hours_end || '18:00',
      sleepStart: dbPrefs?.sleep_start || '23:00',
      sleepEnd: dbPrefs?.sleep_end || '07:00',
    };

    let curTime = currentTimeStr;
    if (!curTime) {
      const now = new Date();
      curTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    const currentMins = timeToMinutes(curTime);

    const missedBlocks = [];

    for (const block of schedule.blocks) {
      if (block.type === 'sleep' || block.type === 'fixed') continue;

      const endMins = timeToMinutes(block.endTime);

      if ((block.status === 'scheduled' && endMins < currentMins) || block.status === 'missed') {
        if (block.status === 'scheduled') {
          await supabaseDb.update('schedule_events', { id: block.id }, { status: 'missed' });
          block.status = 'missed';
        }

        const [sh, sm] = block.startTime.split(':').map(Number);
        const [eh, em] = block.endTime.split(':').map(Number);
        let dur = eh * 60 + em - (sh * 60 + sm);
        if (dur < 0) dur += 1440;

        const suggestions = schedulerEngine.findMultipleAlternativeSlots({
          blocks: schedule.blocks,
          preferences,
          durationMins: dur,
          fromTimeStr: curTime,
          excludeBlockId: block.id,
          limit: 3,
        });

        missedBlocks.push({
          block,
          durationMins: dur,
          passedTime: block.endTime,
          suggestions,
        });
      }
    }

    return {
      date: targetDate,
      currentTime: curTime,
      missedCount: missedBlocks.length,
      missedBlocks,
    };
  }

  /**
   * Suggest alternative available slots for a specific block
   */
  async suggestAlternativeSlots(userId, dateInput = new Date(), blockId, currentTimeStr = null) {
    const targetDate = normalizeDate(dateInput);
    const schedule = await this.getScheduleByDate(userId, targetDate);

    const block = schedule.blocks.find((b) => String(b.id) === String(blockId) || String(b._id) === String(blockId));
    if (!block) throw ApiError.notFound('Schedule block not found');

    const dbPrefs = await supabaseDb.findOne('user_preferences', { user_id: userId });
    const preferences = {
      workingHoursStart: dbPrefs?.working_hours_start || '09:00',
      workingHoursEnd: dbPrefs?.working_hours_end || '18:00',
      sleepStart: dbPrefs?.sleep_start || '23:00',
      sleepEnd: dbPrefs?.sleep_end || '07:00',
    };

    let curTime = currentTimeStr;
    if (!curTime) {
      const now = new Date();
      curTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    const [sh, sm] = block.startTime.split(':').map(Number);
    const [eh, em] = block.endTime.split(':').map(Number);
    let durationMins = eh * 60 + em - (sh * 60 + sm);
    if (durationMins < 0) durationMins += 1440;

    const suggestions = schedulerEngine.findMultipleAlternativeSlots({
      blocks: schedule.blocks,
      preferences,
      durationMins,
      fromTimeStr: curTime,
      excludeBlockId: block.id,
      limit: 3,
    });

    return {
      block,
      durationMins,
      suggestions,
    };
  }

  /**
   * Reschedule a missed block to an alternative slot without overwriting fixed commitments
   */
  async rescheduleMissedBlock(userId, dateInput, blockId, newStartTime, newEndTime) {
    const targetDate = normalizeDate(dateInput);
    const schedule = await this.getScheduleByDate(userId, targetDate);

    const block = schedule.blocks.find((b) => String(b.id) === String(blockId) || String(b._id) === String(blockId));
    if (!block) throw ApiError.notFound('Schedule block not found');

    if (block.type === 'fixed') {
      throw ApiError.badRequest('Cannot reschedule a fixed commitment automatically');
    }

    const newStartMins = timeToMinutes(newStartTime);
    const newEndMins = timeToMinutes(newEndTime);

    if (newEndMins <= newStartMins) {
      throw ApiError.badRequest('End time must be after start time');
    }

    // Collision check against fixed commitments and sleep
    for (const other of schedule.blocks) {
      if (String(other.id) === String(blockId) || String(other._id) === String(blockId)) continue;

      if (other.type === 'fixed' || other.type === 'sleep') {
        const oStart = timeToMinutes(other.startTime);
        const oEnd = timeToMinutes(other.endTime);

        if (oEnd > oStart) {
          if (newStartMins < oEnd && oStart < newEndMins) {
            throw ApiError.conflict(
              `Cannot reschedule: Time slot overlaps with ${other.type} block "${other.title}" (${other.startTime} - ${other.endTime})`
            );
          }
        }
      }
    }

    // Apply the reschedule in schedule_events
    await supabaseDb.update(
      'schedule_events',
      { id: block.id },
      {
        start_time: newStartTime,
        end_time: newEndTime,
        status: 'rescheduled',
      }
    );

    const updatedSchedule = await this.getScheduleByDate(userId, targetDate);
    const updatedBlock = updatedSchedule.blocks.find((b) => String(b.id) === String(blockId));

    return {
      message: `"${block.title}" was rescheduled to ${newStartTime} - ${newEndTime}.`,
      schedule: updatedSchedule,
      rescheduledBlock: updatedBlock || block,
    };
  }
}

module.exports = new ScheduleService();
