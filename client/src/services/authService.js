import api from './api';
import { supabase } from './supabaseClient';

const DEMO_USER = {
  id: 'd3b07384-d113-40f2-b8bb-32e650d03704',
  name: 'Demo Student',
  email: 'demo@mindtonic.ai',
  college: 'CSE Placement Portfolio',
  semester: 8,
};

const DEMO_TOKEN = 'demo-token-mind-tonic-session-cse';

export const authService = {
  /**
   * Register a new user using Supabase Auth (with placement demo support)
   */
  async register({ name, email, password }) {
    if (email === 'demo@mindtonic.ai') {
      localStorage.setItem('accessToken', DEMO_TOKEN);
      localStorage.setItem('refreshToken', 'demo-refresh-token-cse');
      return {
        user: DEMO_USER,
        session: { access_token: DEMO_TOKEN },
      };
    }

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
      if (error.message.includes('rate limit')) {
        throw new Error('Supabase email verification rate limit reached. Click "Quick Demo Account Fill" on the Login page to explore immediately!');
      }
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
   * Login user with Supabase Auth (or 1-Click Demo Login)
   */
  async login({ email, password }) {
    if (email === 'demo@mindtonic.ai') {
      localStorage.setItem('accessToken', DEMO_TOKEN);
      localStorage.setItem('refreshToken', 'demo-refresh-token-cse');
      return {
        user: DEMO_USER,
        session: { access_token: DEMO_TOKEN },
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Click "Create one now" or use the 1-Click Demo Login.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Email not yet confirmed. Please verify your email or use the 1-Click Demo Login.');
      }
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
