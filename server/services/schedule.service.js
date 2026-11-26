const Schedule = require('../models/Schedule');
const Task = require('../models/Task');
const User = require('../models/User');
const schedulerEngine = require('../engines/scheduler');
const { normalizeDate } = require('../utils/timeUtils');
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
}

module.exports = new ScheduleService();
