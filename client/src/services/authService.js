import api from './api';

export const authService = {
  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data?.tokens) {
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    }
    return response.data;
  },

  /**
   * Login user
   */
  async login({ email, password }) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.tokens) {
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    }
    return response.data;
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (_err) {
      // Continue even if network error on logout
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  /**
   * Update user profile & preferences
   */
  async updateProfile(updates) {
    const response = await api.put('/auth/profile', updates);
    return response.data.user;
  },

  /**
   * Change user password
   */
  async changePassword({ currentPassword, newPassword }) {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword,
    });
    if (response.data?.tokens) {
      localStorage.setItem('accessToken', response.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
    }
    return response.data;
  },
};

export default authService;
