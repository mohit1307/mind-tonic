const habitService = require('../services/habit.service');
const apiResponse = require('../utils/apiResponse');

class HabitController {
  async createHabit(req, res, next) {
    try {
      const habit = await habitService.createHabit(req.user.id, req.body);
      return apiResponse.created(res, { habit }, 'Habit created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getHabits(req, res, next) {
    try {
      const habits = await habitService.getHabits(req.user.id);
      return apiResponse.success(res, { habits }, 'Habits retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getHabitById(req, res, next) {
    try {
      const result = await habitService.getHabitById(req.user.id, req.params.id);
      return apiResponse.success(res, result, 'Habit details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateHabit(req, res, next) {
    try {
      const habit = await habitService.updateHabit(req.user.id, req.params.id, req.body);
      return apiResponse.success(res, { habit }, 'Habit updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteHabit(req, res, next) {
    try {
      await habitService.deleteHabit(req.user.id, req.params.id);
      return apiResponse.success(res, null, 'Habit deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleLog(req, res, next) {
    try {
      const { date, notes } = req.body;
      const result = await habitService.toggleHabitLog(
        req.user.id,
        req.params.id,
        date,
        notes
      );
      return apiResponse.success(res, result, 'Habit completion updated');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await habitService.getHabitStats(req.user.id);
      return apiResponse.success(res, { stats }, 'Habit stats retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HabitController();
