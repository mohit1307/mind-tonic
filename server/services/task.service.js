const Task = require('../models/Task');
const ApiError = require('../utils/apiError');

class TaskService {
  /**
   * Create a new task
   */
  async createTask(userId, taskData) {
    const task = new Task({
      ...taskData,
      userId,
      completedAt: taskData.status === 'completed' ? new Date() : null,
    });
    return await task.save();
  }

  /**
   * Get all tasks with filtering, search, and pagination
   */
  async getTasks(userId, query = {}) {
    const {
      status,
      category,
      priority,
      search,
      isFixed,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter = { userId };

    // Status filter
    if (status && status !== 'all') {
      if (status === 'overdue') {
        filter.status = { $ne: 'completed' };
        filter.deadline = { $lt: new Date() };
      } else {
        filter.status = status;
      }
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Priority filter
    if (priority) {
      filter.priority = priority;
    }

    // Fixed commitment filter
    if (typeof isFixed === 'boolean') {
      filter.isFixed = isFixed;
    }

    // Date range filter on deadline
    if (startDate || endDate) {
      filter.deadline = {};
      if (startDate) filter.deadline.$gte = new Date(startDate);
      if (endDate) filter.deadline.$lte = new Date(endDate);
    }

    // Search query
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    const sort = {};
    if (sortBy === 'priority') {
      // Map priority to weight if sorting by priority
      sort.priority = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ]);

    return {
      tasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get task by ID (ensuring ownership)
   */
  async getTaskById(userId, taskId) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      throw ApiError.notFound('Task not found');
    }
    return task;
  }

  /**
   * Update task by ID
   */
  async updateTask(userId, taskId, updates) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Handle completedAt timestamp
    if (updates.status === 'completed' && task.status !== 'completed') {
      updates.completedAt = new Date();
    } else if (updates.status && updates.status !== 'completed') {
      updates.completedAt = null;
    }

    Object.assign(task, updates);
    return await task.save();
  }

  /**
   * Delete task by ID
   */
  async deleteTask(userId, taskId) {
    const result = await Task.findOneAndDelete({ _id: taskId, userId });
    if (!result) {
      throw ApiError.notFound('Task not found');
    }
    return result;
  }

  /**
   * Toggle task completion
   */
  async toggleComplete(userId, taskId) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    if (task.status === 'completed') {
      task.status = 'pending';
      task.completedAt = null;
    } else {
      task.status = 'completed';
      task.completedAt = new Date();
    }

    return await task.save();
  }

  /**
   * Update task status
   */
  async updateStatus(userId, taskId, status) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    task.status = status;
    task.completedAt = status === 'completed' ? new Date() : null;

    return await task.save();
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(userId) {
    return await Task.find({
      userId,
      status: { $ne: 'completed' },
      deadline: { $lt: new Date() },
    }).sort({ deadline: 1 });
  }

  /**
   * Get upcoming deadlines (e.g., within next 7 days)
   */
  async getUpcomingDeadlines(userId, daysAhead = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead);

    return await Task.find({
      userId,
      status: { $ne: 'completed' },
      deadline: { $gte: now, $lte: futureDate },
    }).sort({ deadline: 1 });
  }

  /**
   * Get task statistics for dashboard & metrics
   */
  async getTaskStats(userId) {
    const now = new Date();

    const [total, completed, inProgress, pending, overdue, priorityCounts] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: 'completed' }),
      Task.countDocuments({ userId, status: 'in_progress' }),
      Task.countDocuments({ userId, status: 'pending' }),
      Task.countDocuments({ userId, status: { $ne: 'completed' }, deadline: { $lt: now } }),
      Task.aggregate([
        { $match: { userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
    ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const priorityMap = { critical: 0, high: 0, medium: 0, low: 0 };
    priorityCounts.forEach((p) => {
      if (priorityMap[p._id] !== undefined) {
        priorityMap[p._id] = p.count;
      }
    });

    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      completionRate,
      priorityDistribution: priorityMap,
    };
  }
}

module.exports = new TaskService();
