const scheduleService = require('../services/schedule.service');
const apiResponse = require('../utils/apiResponse');

class ScheduleController {
  async getScheduleByDate(req, res, next) {
    try {
      const { date } = req.params;
      const schedule = await scheduleService.getScheduleByDate(req.user.id, date);
      return apiResponse.success(res, { schedule }, 'Schedule retrieved');
    } catch (error) {
      next(error);
    }
  }

  async generateSchedule(req, res, next) {
    try {
      const schedule = await scheduleService.generateSchedule(req.user.id, req.body);
      return apiResponse.success(
        res,
        { schedule },
        'Intelligent timetable generated successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async updateSchedule(req, res, next) {
    try {
      const { date } = req.params;
      const { blocks } = req.body;
      const schedule = await scheduleService.updateSchedule(req.user.id, date, blocks);
      return apiResponse.success(res, { schedule }, 'Schedule updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateBlock(req, res, next) {
    try {
      const { date, blockId } = req.params;
      const schedule = await scheduleService.updateBlock(
        req.user.id,
        date,
        blockId,
        req.body
      );
      return apiResponse.success(res, { schedule }, 'Block updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteBlock(req, res, next) {
    try {
      const { date, blockId } = req.params;
      const schedule = await scheduleService.deleteBlock(req.user.id, date, blockId);
      return apiResponse.success(res, { schedule }, 'Block removed from schedule');
    } catch (error) {
      next(error);
    }
  }

  async getWeekSchedule(req, res, next) {
    try {
      const { startDate } = req.params;
      const schedules = await scheduleService.getWeekSchedule(req.user.id, startDate);
      return apiResponse.success(res, { schedules }, 'Week schedule retrieved');
    } catch (error) {
      next(error);
    }
  }

  async detectMissed(req, res, next) {
    try {
      const { date, currentTime } = req.query;
      const result = await scheduleService.detectMissedBlocks(req.user.id, date, currentTime);
      return apiResponse.success(res, result, 'Missed tasks detection completed');
    } catch (error) {
      next(error);
    }
  }

  async suggestMissed(req, res, next) {
    try {
      const { date, blockId, currentTime } = req.body;
      const result = await scheduleService.suggestAlternativeSlots(
        req.user.id,
        date,
        blockId,
        currentTime
      );
      return apiResponse.success(res, result, 'Alternative slots suggested');
    } catch (error) {
      next(error);
    }
  }

  async applyMissed(req, res, next) {
    try {
      const { date, blockId, newStartTime, newEndTime } = req.body;
      const result = await scheduleService.rescheduleMissedBlock(
        req.user.id,
        date,
        blockId,
        newStartTime,
        newEndTime
      );
      return apiResponse.success(res, result, 'Task rescheduled successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScheduleController();
