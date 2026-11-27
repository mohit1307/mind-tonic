import api from './api';

export const scheduleService = {
  /**
   * Get schedule for a specific date (YYYY-MM-DD or ISO string)
   */
  async getScheduleByDate(date) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const response = await api.get(`/schedule/${dateStr}`);
    return response.data?.schedule || response.schedule || response.data || null;
  },

  /**
   * Generate schedule using constraint algorithm
   */
  async generateSchedule(options = {}) {
    const response = await api.post('/schedule/generate', options);
    return response.data?.schedule || response.schedule || response.data || null;
  },

  /**
   * Update full schedule
   */
  async updateSchedule(date, blocks) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const response = await api.put(`/schedule/${dateStr}`, { blocks });
    return response.data?.schedule || response.schedule || response.data || null;
  },

  /**
   * Update a single block inside a schedule
   */
  async updateBlock(date, blockId, updates) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const response = await api.patch(`/schedule/${dateStr}/block/${blockId}`, updates);
    return response.data?.schedule || response.schedule || response.data || null;
  },

  /**
   * Delete a single block
   */
  async deleteBlock(date, blockId) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const response = await api.delete(`/schedule/${dateStr}/block/${blockId}`);
    return response.data?.schedule || response.schedule || response.data || null;
  },

  /**
   * Get week overview
   */
  async getWeekSchedule(startDate) {
    const dateStr = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
    const response = await api.get(`/schedule/week/${dateStr}`);
    return response.data?.schedules || response.schedules || response.data || [];
  },

  /**
   * Detect missed tasks for a given date
   */
  async detectMissed(date, currentTime = null) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const response = await api.get('/schedule/missed/detect', {
      params: { date: dateStr, currentTime },
    });
    return response.data;
  },

  /**
   * Get alternative slots for a specific missed block
   */
  async suggestMissed(date, blockId, currentTime = null) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const response = await api.post('/schedule/missed/suggest', {
      date: dateStr,
      blockId,
      currentTime,
    });
    return response.data;
  },

  /**
   * Apply rescheduling to a new slot
   */
  async applyMissed(date, blockId, newStartTime, newEndTime) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const response = await api.post('/schedule/missed/apply', {
      date: dateStr,
      blockId,
      newStartTime,
      newEndTime,
    });
    return response.data;
  },
};

export default scheduleService;
