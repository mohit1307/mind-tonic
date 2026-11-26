const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const User = require('../models/User');
const schedulerEngine = require('../engines/scheduler');
const { normalizeDate, timeToMinutes, minutesToTime, doTimesOverlap } = require('../utils/timeUtils');
const ApiError = require('../utils/apiError');

class ScheduleService {
  /**
   * Get schedule for a specific date
   */
  async getScheduleByDate(userId, dateInput) {
    const targetDate = normalizeDate(dateInput || new Date());
    let schedule = await Schedule.findOne({ userId, date: targetDate });

    // If no schedule exists yet for today, return a draft structure with empty blocks
    if (!schedule) {
      return {
        date: targetDate,
        blocks: [],
        aiGenerated: false,
        isDraft: true,
      };
    }

    return schedule;
  }

  /**
   * Generate an optimized timetable using the scheduling engine
   */
  async generateSchedule(userId, { date, taskIds, includeOverdue = true, preferences = {} } = {}) {
    const targetDate = normalizeDate(date || new Date());

    // 1. Fetch user to retrieve their default working/sleep preferences
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const combinedPreferences = {
      ...user.preferences.toObject(),
      ...preferences,
    };

    // 2. Query applicable tasks
    let taskQuery = { userId };

    if (taskIds && taskIds.length > 0) {
      taskQuery._id = { $in: taskIds };
    } else {
      // Pull pending or in_progress tasks + any fixed commitments
      taskQuery.$or = [
        { status: { $in: ['pending', 'in_progress'] } },
        { isFixed: true },
      ];

      // Exclude overdue if explicitly requested
      if (!includeOverdue) {
        taskQuery.deadline = { $gte: new Date() };
      }
    }

    const tasks = await Task.find(taskQuery);

    // 3. Run deterministic scheduling algorithm
    const generatedBlocks = schedulerEngine.generateDailySchedule({
      tasks,
      preferences: combinedPreferences,
      targetDate,
    });

    // 4. Save or update the schedule document in MongoDB
    let schedule = await Schedule.findOne({ userId, date: targetDate });

    if (schedule) {
      schedule.blocks = generatedBlocks;
      schedule.aiGenerated = true;
      await schedule.save();
    } else {
      schedule = await Schedule.create({
        userId,
        date: targetDate,
        blocks: generatedBlocks,
        aiGenerated: true,
      });
    }

    return schedule;
  }

  /**
   * Update full schedule blocks for a date
   */
  async updateSchedule(userId, dateInput, blocks) {
    const targetDate = normalizeDate(dateInput);

    let schedule = await Schedule.findOne({ userId, date: targetDate });
    if (!schedule) {
      schedule = await Schedule.create({
        userId,
        date: targetDate,
        blocks,
        aiGenerated: false,
      });
    } else {
      schedule.blocks = blocks;
      await schedule.save();
    }

    return schedule;
  }

  /**
   * Update single block inside a schedule
   */
  async updateBlock(userId, dateInput, blockId, updates) {
    const targetDate = normalizeDate(dateInput);
    const schedule = await Schedule.findOne({ userId, date: targetDate });

    if (!schedule) throw ApiError.notFound('Schedule not found for this date');

    const block = schedule.blocks.id(blockId);
    if (!block) throw ApiError.notFound('Schedule block not found');

    Object.assign(block, updates);
    await schedule.save();

    // If block is associated with a task and status changed to completed, update the Task as well
    if (block.taskId && updates.status) {
      if (updates.status === 'completed') {
        await Task.findByIdAndUpdate(block.taskId, {
          status: 'completed',
          completedAt: new Date(),
        });
      } else if (updates.status === 'scheduled') {
        await Task.findByIdAndUpdate(block.taskId, {
          status: 'pending',
          completedAt: null,
        });
      }
    }

    return schedule;
  }

  /**
   * Delete a single block from a schedule
   */
  async deleteBlock(userId, dateInput, blockId) {
    const targetDate = normalizeDate(dateInput);
    const schedule = await Schedule.findOne({ userId, date: targetDate });

    if (!schedule) throw ApiError.notFound('Schedule not found for this date');

    schedule.blocks.pull({ _id: blockId });
    await schedule.save();

    return schedule;
  }

  /**
   * Get 7-day schedule view starting from given date
   */
  async getWeekSchedule(userId, startDateInput) {
    const start = normalizeDate(startDateInput || new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const schedules = await Schedule.find({
      userId,
      date: { $gte: start, $lt: end },
    }).sort({ date: 1 });

    return schedules;
  }

  /**
   * Detect any missed tasks whose scheduled time window has passed
   */
  async detectMissedBlocks(userId, dateInput = new Date(), currentTimeStr = null) {
    const targetDate = normalizeDate(dateInput);
    const schedule = await Schedule.findOne({ userId, date: targetDate });
    if (!schedule || !schedule.blocks || schedule.blocks.length === 0) {
      return { missedBlocks: [] };
    }

    const user = await User.findById(userId);
    const preferences = user?.preferences || {};

    // Determine current time
    let curTime = currentTimeStr;
    if (!curTime) {
      const now = new Date();
      curTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    const currentMins = timeToMinutes(curTime);

    const missedBlocks = [];
    let scheduleUpdated = false;

    for (const block of schedule.blocks) {
      // Only check flexible/study tasks that are scheduled and not completed
      if (block.type === 'sleep' || block.type === 'fixed') continue;

      const endMins = timeToMinutes(block.endTime);

      // If scheduled time has passed and block is not completed
      if (block.status === 'scheduled' && endMins < currentMins) {
        block.status = 'missed';
        scheduleUpdated = true;

        // Calculate duration
        const [sh, sm] = block.startTime.split(':').map(Number);
        const [eh, em] = block.endTime.split(':').map(Number);
        let dur = eh * 60 + em - (sh * 60 + sm);
        if (dur < 0) dur += 1440;

        // Find alternative suggestions
        const suggestions = schedulerEngine.findMultipleAlternativeSlots({
          blocks: schedule.blocks,
          preferences,
          durationMins: dur,
          fromTimeStr: curTime,
          excludeBlockId: block._id,
          limit: 3,
        });

        missedBlocks.push({
          block,
          durationMins: dur,
          passedTime: block.endTime,
          suggestions,
        });
      } else if (block.status === 'missed') {
        // Already flagged as missed, also generate suggestions
        const [sh, sm] = block.startTime.split(':').map(Number);
        const [eh, em] = block.endTime.split(':').map(Number);
        let dur = eh * 60 + em - (sh * 60 + sm);
        if (dur < 0) dur += 1440;

        const suggestions = schedulerEngine.findMultipleAlternativeSlots({
          blocks: schedule.blocks,
          preferences,
          durationMins: dur,
          fromTimeStr: curTime,
          excludeBlockId: block._id,
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

    if (scheduleUpdated) {
      await schedule.save();
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
    const schedule = await Schedule.findOne({ userId, date: targetDate });
    if (!schedule) throw ApiError.notFound('Schedule not found');

    const block = schedule.blocks.id(blockId);
    if (!block) throw ApiError.notFound('Schedule block not found');

    const user = await User.findById(userId);
    const preferences = user?.preferences || {};

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
      excludeBlockId: block._id,
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
    const schedule = await Schedule.findOne({ userId, date: targetDate });
    if (!schedule) throw ApiError.notFound('Schedule not found');

    const block = schedule.blocks.id(blockId);
    if (!block) throw ApiError.notFound('Schedule block not found');

    if (block.type === 'fixed') {
      throw ApiError.badRequest('Cannot reschedule a fixed commitment automatically');
    }

    const newStartMins = timeToMinutes(newStartTime);
    const newEndMins = timeToMinutes(newEndTime);

    if (newEndMins <= newStartMins) {
      throw ApiError.badRequest('End time must be after start time');
    }

    // Collision check: verify new slot doesn't collide with any fixed commitment or sleep window
    for (const other of schedule.blocks) {
      if (other._id.toString() === blockId.toString()) continue;

      // Check collision with fixed commitments or sleep
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

    // Apply the reschedule
    block.startTime = newStartTime;
    block.endTime = newEndTime;
    block.status = 'rescheduled';

    // Sort blocks chronologically
    schedule.blocks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    await schedule.save();

    return {
      message: `"${block.title}" was rescheduled to ${newStartTime} - ${newEndTime}.`,
      schedule,
      rescheduledBlock: block,
    };
  }
}

module.exports = new ScheduleService();
