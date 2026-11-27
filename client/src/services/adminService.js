import api from './api';

export const adminService = {
  /**
   * Get unified admin dashboard overview metrics
   */
  async getOverview() {
    const response = await api.get('/admin/overview');
    return response.data;
  },

  /**
   * Get registered users list with search & filter
   */
  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Update user status (active / suspended)
   */
  async updateUserStatus(userId, status) {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  /**
   * Get platform activity & audit logs
   */
  async getLogs() {
    const response = await api.get('/admin/logs');
    return response.data;
  },

  /**
   * Get platform website settings
   */
  async getSettings() {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  /**
   * Update platform website settings
   */
  async updateSettings(settings) {
    const response = await api.post('/admin/settings', settings);
    return response.data;
  },
};

export default adminService;
