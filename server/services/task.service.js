const { supabaseDb } = require('../db/supabaseDb');
const ApiError = require('../utils/apiError');

/**
 * Mapper helper: converts Supabase PostgreSQL task row to API format
 */
function mapTaskToApi(t) {
  if (!t) return null;
  return {
    _id: t.id,
    id: t.id,
    userId: t.user_id,
    title: t.title,
    description: t.description || '',
    priority: t.priority === 'urgent' ? 'high' : t.priority || 'medium',
    category: t.category || 'study',
    status: t.status || 'pending',
    estimatedDuration: t.estimated_duration || 60,
    deadline: t.deadline || null,
    isFixed: Boolean(t.is_fixed),
    fixedStartTime: t.fixed_start_time || null,
    fixedEndTime: t.fixed_end_time || null,
    isRecurring: Boolean(t.is_recurring),
    recurrencePattern: t.recurrence_pattern || null,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    completedAt: t.status === 'completed' ? t.updated_at : null,
  };
}

/**
 * Mapper helper: converts API task input to PostgreSQL row format
 */
function mapApiToTask(taskData) {
  const row = {};
  if (taskData.title !== undefined) row.title = taskData.title.trim();
  if (taskData.description !== undefined) row.description = taskData.description;
  if (taskData.priority !== undefined) {
    row.priority = taskData.priority === 'critical' ? 'urgent' : taskData.priority;
  }
  if (taskData.category !== undefined) row.category = taskData.category;
  if (taskData.status !== undefined) row.status = taskData.status;
  if (taskData.estimatedDuration !== undefined) {
    row.estimated_duration = Number(taskData.estimatedDuration) || 60;
  }
  if (taskData.deadline !== undefined) {
    row.deadline = taskData.deadline ? new Date(taskData.deadline).toISOString() : null;
  }
  if (taskData.isFixed !== undefined) row.is_fixed = Boolean(taskData.isFixed);
  if (taskData.fixedStartTime !== undefined) row.fixed_start_time = taskData.fixedStartTime;
  if (taskData.fixedEndTime !== undefined) row.fixed_end_time = taskData.fixedEndTime;
  if (taskData.isRecurring !== undefined) row.is_recurring = Boolean(taskData.isRecurring);
  if (taskData.recurrencePattern !== undefined) row.recurrence_pattern = taskData.recurrencePattern;
  return row;
}

class TaskService {
  /**
   * Create a new task
   */
  async createTask(userId, taskData) {
    const row = {
      ...mapApiToTask(taskData),
      user_id: userId,
    };
    const created = await supabaseDb.insert('tasks', row);
    return mapTaskToApi(created);
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
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = query;

    let q = supabaseDb.client
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Status filter
    if (status && status !== 'all') {
      if (status === 'overdue') {
        q = q.neq('status', 'completed').lt('deadline', new Date().toISOString());
      } else {
        q = q.eq('status', status);
      }
    }

    // Category filter
    if (category) {
      q = q.eq('category', category);
    }

    // Priority filter
    if (priority) {
      q = q.eq('priority', priority === 'critical' ? 'urgent' : priority);
    }

    // Fixed commitment filter
    if (isFixed !== undefined && isFixed !== null) {
      q = q.eq('is_fixed', String(isFixed) === 'true');
    }

    // Date range filter on deadline
    if (startDate) {
      q = q.gte('deadline', new Date(startDate).toISOString());
    }
    if (endDate) {
      q = q.lte('deadline', new Date(endDate).toISOString());
    }

    // Search query on title or description
    if (search && search.trim()) {
      q = q.or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
    }

    // Sorting
    const sortColumn = sortBy === 'createdAt' ? 'created_at' : sortBy === 'updatedAt' ? 'updated_at' : sortBy;
    q = q.order(sortColumn, { ascending: sortOrder === 'asc' });

    // Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const offset = (pageNum - 1) * limitNum;
    q = q.range(offset, offset + limitNum - 1);

    const { data, error, count } = await q;
    if (error) {
      throw ApiError.badRequest(`Failed to query tasks: ${error.message}`);
    }

    const tasks = (data || []).map(mapTaskToApi);
    const total = count || tasks.length;

    return {
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Get task by ID (ensuring ownership)
   */
  async getTaskById(userId, taskId) {
    const task = await supabaseDb.findById('tasks', taskId, userId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }
    return mapTaskToApi(task);
  }

  /**
   * Update task by ID
   */
  async updateTask(userId, taskId, updates) {
    const existing = await supabaseDb.findById('tasks', taskId, userId);
    if (!existing) {
      throw ApiError.notFound('Task not found');
    }

    const updateRow = mapApiToTask(updates);
    const updatedRows = await supabaseDb.update('tasks', { id: taskId, user_id: userId }, updateRow);
    const updated = updatedRows?.[0] || { ...existing, ...updateRow };
    return mapTaskToApi(updated);
  }

  /**
   * Delete task by ID
   */
  async deleteTask(userId, taskId) {
    const existing = await supabaseDb.findById('tasks', taskId, userId);
    if (!existing) {
      throw ApiError.notFound('Task not found');
    }

    await supabaseDb.delete('tasks', { id: taskId, user_id: userId });
    return mapTaskToApi(existing);
  }

  /**
   * Toggle task completion
   */
  async toggleComplete(userId, taskId) {
    const task = await supabaseDb.findById('tasks', taskId, userId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updatedRows = await supabaseDb.update('tasks', { id: taskId, user_id: userId }, { status: newStatus });
    return mapTaskToApi(updatedRows?.[0] || { ...task, status: newStatus });
  }

  /**
   * Update task status
   */
  async updateStatus(userId, taskId, status) {
    const task = await supabaseDb.findById('tasks', taskId, userId);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const updatedRows = await supabaseDb.update('tasks', { id: taskId, user_id: userId }, { status });
    return mapTaskToApi(updatedRows?.[0] || { ...task, status });
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(userId) {
    const { data } = await supabaseDb.client
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'completed')
      .lt('deadline', new Date().toISOString())
      .order('deadline', { ascending: true });

    return (data || []).map(mapTaskToApi);
  }

  /**
   * Get upcoming deadlines (within next daysAhead days)
   */
  async getUpcomingDeadlines(userId, daysAhead = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead);

    const { data } = await supabaseDb.client
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'completed')
      .gte('deadline', now.toISOString())
      .lte('deadline', futureDate.toISOString())
      .order('deadline', { ascending: true });

    return (data || []).map(mapTaskToApi);
  }

  /**
   * Get task statistics for dashboard & metrics
   */
  async getTaskStats(userId) {
    const { data: allTasks, error } = await supabaseDb.client
      .from('tasks')
      .select('status, priority, deadline')
      .eq('user_id', userId);

    if (error) {
      console.warn('getTaskStats fallback:', error.message);
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        overdue: 0,
        completionRate: 0,
        priorityDistribution: { high: 0, medium: 0, low: 0, urgent: 0 },
      };
    }

    const tasks = allTasks || [];
    const now = new Date();

    let total = tasks.length;
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    let overdue = 0;
    const priorityMap = { high: 0, medium: 0, low: 0, urgent: 0 };

    tasks.forEach((t) => {
      if (t.status === 'completed') completed++;
      else if (t.status === 'in_progress') inProgress++;
      else pending++;

      if (t.status !== 'completed' && t.deadline && new Date(t.deadline) < now) {
        overdue++;
      }

      const p = t.priority || 'medium';
      if (priorityMap[p] !== undefined) {
        priorityMap[p]++;
      }
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

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
