const taskService = require('../services/task.service');
const apiResponse = require('../utils/apiResponse');

class TaskController {
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.user.id, req.body);
      return apiResponse.created(res, { task }, 'Task created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTasks(req, res, next) {
    try {
      const result = await taskService.getTasks(req.user.id, req.query);
      return apiResponse.paginated(
        res,
        result.tasks,
        result.pagination,
        'Tasks retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.user.id, req.params.id);
      return apiResponse.success(res, { task }, 'Task details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(req.user.id, req.params.id, req.body);
      return apiResponse.success(res, { task }, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.user.id, req.params.id);
      return apiResponse.success(res, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleComplete(req, res, next) {
    try {
      const task = await taskService.toggleComplete(req.user.id, req.params.id);
      return apiResponse.success(res, { task }, 'Task completion updated');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const task = await taskService.updateStatus(req.user.id, req.params.id, status);
      return apiResponse.success(res, { task }, 'Task status updated');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await taskService.getTaskStats(req.user.id);
      return apiResponse.success(res, { stats }, 'Task statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getOverdue(req, res, next) {
    try {
      const tasks = await taskService.getOverdueTasks(req.user.id);
      return apiResponse.success(res, { tasks }, 'Overdue tasks retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getUpcoming(req, res, next) {
    try {
      const days = req.query.days ? parseInt(req.query.days, 10) : 7;
      const tasks = await taskService.getUpcomingDeadlines(req.user.id, days);
      return apiResponse.success(res, { tasks }, 'Upcoming tasks retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
