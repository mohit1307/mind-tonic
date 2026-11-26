const taskService = require('./task.service');
const scheduleService = require('./schedule.service');
const habitService = require('./habit.service');
const ApiError = require('../utils/apiError');

class ActionService {
  /**
   * Deterministically execute a validated user-confirmed action
   */
  async execute(userId, action) {
    const { type, parameters } = action;

    switch (type) {
      case 'create_task': {
        const created = await taskService.createTask(userId, {
          title: parameters.title,
          description: parameters.description || '',
          category: parameters.category || 'personal',
          priority: parameters.priority || 'medium',
          estimatedDuration: parameters.estimatedDuration || 60,
          deadline: parameters.deadline || null,
          isFixed: parameters.isFixed || false,
          fixedStartTime: parameters.fixedStartTime || null,
          fixedEndTime: parameters.fixedEndTime || null,
          tags: parameters.tags || [],
        });
        return {
          message: `Task "${created.title}" was successfully created.`,
          task: created,
        };
      }

      case 'generate_schedule': {
        const schedule = await scheduleService.generateSchedule(userId, {
          date: parameters.date || new Date().toISOString(),
        });
        return {
          message: `Daily timetable was generated with ${schedule.blocks.length} blocks.`,
          schedule,
        };
      }

      case 'reschedule_block': {
        const { date, blockId, startTime, endTime } = parameters;
        const updated = await scheduleService.updateBlock(userId, date, blockId, {
          startTime,
          endTime,
        });
        return {
          message: `Session moved to ${startTime} - ${endTime}.`,
          schedule: updated,
        };
      }

      case 'reschedule_missed': {
        const { date, blockId, newStartTime, newEndTime } = parameters;
        const result = await scheduleService.rescheduleMissedBlock(
          userId,
          date || new Date().toISOString(),
          blockId,
          newStartTime,
          newEndTime
        );
        return {
          message: result.message,
          schedule: result.schedule,
          rescheduledBlock: result.rescheduledBlock,
        };
      }

      case 'complete_task': {
        const task = await taskService.toggleComplete(userId, parameters.taskId);
        return {
          message: `Task "${task.title}" status updated to ${task.status}.`,
          task,
        };
      }

      case 'create_habit': {
        const habit = await habitService.createHabit(userId, {
          name: parameters.name,
          description: parameters.description || '',
          frequency: parameters.frequency || 'daily',
          color: parameters.color || '#8b5cf6',
          icon: parameters.icon || 'Target',
        });
        return {
          message: `Habit "${habit.name}" created.`,
          habit,
        };
      }

      case 'log_habit': {
        const result = await habitService.toggleHabitLog(
          userId,
          parameters.habitId,
          parameters.date || new Date()
        );
        return {
          message: `Habit check-in recorded! Current streak: ${result.currentStreak} days.`,
          result,
        };
      }

      default:
        throw ApiError.badRequest(`Unknown action type: ${type}`);
    }
  }
}

module.exports = new ActionService();
