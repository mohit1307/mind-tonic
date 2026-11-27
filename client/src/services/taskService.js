import api from './api';

export const taskService = {
  /**
   * Get tasks with filters & pagination
   */
  async getTasks(params = {}) {
    const res = await api.get('/tasks', { params });
    // Normalize response: returns { tasks, pagination } or { data: tasks, pagination }
    const tasks = res.data?.tasks || (Array.isArray(res.data) ? res.data : res.tasks) || [];
    const pagination = res.pagination || res.data?.pagination || { page: 1, total: tasks.length, totalPages: 1 };
    return {
      success: true,
      tasks,
      data: tasks,
      pagination,
    };
  },

  /**
   * Get single task details
   */
  async getTaskById(id) {
    const res = await api.get(`/tasks/${id}`);
    return res.data?.task || res.task || res.data || res;
  },

  /**
   * Create a new task
   */
  async createTask(taskData) {
    const res = await api.post('/tasks', taskData);
    return res.data?.task || res.task || res.data || res;
  },

  /**
   * Update an existing task
   */
  async updateTask(id, updates) {
    const res = await api.put(`/tasks/${id}`, updates);
    return res.data?.task || res.task || res.data || res;
  },

  /**
   * Delete a task
   */
  async deleteTask(id) {
    const res = await api.delete(`/tasks/${id}`);
    return res.data || res;
  },

  /**
   * Toggle task completion
   */
  async toggleComplete(id) {
    const res = await api.patch(`/tasks/${id}/complete`);
    return res.data?.task || res.task || res.data || res;
  },

  /**
   * Update task status
   */
  async updateStatus(id, status) {
    const res = await api.patch(`/tasks/${id}/status`, { status });
    return res.data?.task || res.task || res.data || res;
  },

  /**
   * Get task statistics
   */
  async getStats() {
    const res = await api.get('/tasks/stats');
    return res.data?.stats || res.stats || res.data || {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
      overdue: 0,
      completionRate: 0,
    };
  },

  /**
   * Get overdue tasks
   */
  async getOverdue() {
    const res = await api.get('/tasks/overdue');
    return res.data?.tasks || res.tasks || res.data || [];
  },

  /**
   * Get upcoming tasks with deadlines
   */
  async getUpcoming(days = 7) {
    const res = await api.get('/tasks/upcoming', { params: { days } });
    return res.data?.tasks || res.tasks || res.data || [];
  },
};

export default taskService;
