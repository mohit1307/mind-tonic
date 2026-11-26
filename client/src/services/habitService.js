import api from './api';

export const habitService = {
  /**
   * Get all active habits with today's status & 7-day history
   */
  async getHabits() {
    const response = await api.get('/habits');
    return response.data.habits;
  },

  /**
   * Get single habit details
   */
  async getHabitById(id) {
    const response = await api.get(`/habits/${id}`);
    return response.data;
  },

  /**
   * Create a new habit
   */
  async createHabit(habitData) {
    const response = await api.post('/habits', habitData);
    return response.data.habit;
  },

  /**
   * Update habit
   */
  async updateHabit(id, updates) {
    const response = await api.put(`/habits/${id}`, updates);
    return response.data.habit;
  },

  /**
   * Delete habit
   */
  async deleteHabit(id) {
    const response = await api.delete(`/habits/${id}`);
    return response.data;
  },

  /**
   * Toggle completion log for a date
   */
  async toggleHabit(id, date = new Date(), notes = '') {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const response = await api.post(`/habits/${id}/toggle`, { date: dateStr, notes });
    return response.data;
  },

  /**
   * Get habit statistics & 7-day chart data
   */
  async getStats() {
    const response = await api.get('/habits/stats');
    return response.data.stats;
  },
};

export default habitService;
