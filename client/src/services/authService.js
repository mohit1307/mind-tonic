import api from './api';
import { supabase } from './supabaseClient';

export const authService = {
  /**
   * Register a new user using Supabase Auth
   */
  async register({ name, email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          full_name: name,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session?.access_token) {
      localStorage.setItem('accessToken', data.session.access_token);
      localStorage.setItem('refreshToken', data.session.refresh_token || '');
    }

    let user = null;
    if (data.session) {
      try {
        user = await this.getMe();
      } catch (_e) {
        user = {
          id: data.user?.id,
          name: name,
          email: email,
        };
      }
    } else {
      user = {
        id: data.user?.id,
        name: name,
        email: email,
        emailConfirmationPending: true,
      };
    }

    return {
      user,
      session: data.session,
    };
  },

  /**
   * Login user with Supabase Auth
   */
  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session?.access_token) {
      localStorage.setItem('accessToken', data.session.access_token);
      localStorage.setItem('refreshToken', data.session.refresh_token || '');
    }

    let user = null;
    try {
      user = await this.getMe();
    } catch (_e) {
      user = {
        id: data.user?.id,
        name: data.user?.user_metadata?.name || data.user?.email?.split('@')[0],
        email: data.user?.email,
      };
    }

    return {
      user,
      session: data.session,
    };
  },

  /**
   * Logout user via Supabase Auth
   */
  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (_err) {
      // Continue even if network error on logout
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Get current authenticated user profile from backend
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data?.user || response.data;
  },

  /**
   * Update user profile & preferences
   */
  async updateProfile(updates) {
    const response = await api.put('/auth/profile', updates);
    return response.data?.user || response.data;
  },

  /**
   * Change user password via Supabase Auth
   */
  async changePassword({ newPassword }) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      throw new Error(error.message);
    }
    return { message: 'Password changed successfully', user: data.user };
  },
};

export default authService;
