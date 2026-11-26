import api from './api';

export const taskService = {
  /**
   * Get tasks with filters & pagination
   */
  async getTasks(params = {}) {
    const response = await api.get('/tasks', { params });
    return response;
  },

  /**
   * Get single task details
   */
  async getTaskById(id) {
    const response = await api.get(`/tasks/${id}`);
    return response.data.task;
  },

  /**
   * Create a new task
   */
  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return response.data.task;
  },

  /**
   * Update an existing task
   */
  async updateTask(id, updates) {
    const response = await api.put(`/tasks/${id}`, updates);
    return response.data.task;
  },

  /**
   * Delete a task
   */
  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Toggle task completion
   */
  async toggleComplete(id) {
    const response = await api.patch(`/tasks/${id}/complete`);
    return response.data.task;
  },

  /**
   * Update task status
   */
  async updateStatus(id, status) {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data.task;
  },

  /**
   * Get task statistics
   */
  async getStats() {
    const response = await api.get('/tasks/stats');
    return response.data.stats;
  },

  /**
   * Get overdue tasks
   */
  async getOverdue() {
    const response = await api.get('/tasks/overdue');
    return response.data.tasks;
  },

  /**
   * Get upcoming tasks with deadlines
   */
  async getUpcoming(days = 7) {
    const response = await api.get('/tasks/upcoming', { params: { days } });
    return response.data.tasks;
  },
};

export default taskService;
