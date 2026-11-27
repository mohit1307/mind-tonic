const { supabase } = require('../config/supabase');
const { supabaseDb } = require('../db/supabaseDb');
const ApiError = require('../utils/apiError');

const DEMO_USER = {
  id: 'd3b07384-d113-40f2-b8bb-32e650d03704',
  name: 'Demo Student',
  email: 'demo@mindtonic.ai',
  avatar: null,
  college: 'CSE Placement Portfolio',
  semester: 8,
};

class AuthService {
  /**
   * Register a new user with Supabase Auth
   */
  async register({ name, email, password }) {
    if (email === 'demo@mindtonic.ai') {
      return {
        user: DEMO_USER,
        tokens: {
          accessToken: 'demo-token-mind-tonic-session-cse',
          refreshToken: 'demo-refresh-token-cse',
        },
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
      if (error.message.includes('already registered')) {
        throw ApiError.conflict('An account with this email already exists');
      }
      if (error.message.includes('rate limit')) {
        throw ApiError.badRequest('Supabase email verification rate limit reached. Please use the 1-Click Demo Account to log in immediately.');
      }
      throw ApiError.badRequest(error.message);
    }

    const user = data.user;
    if (user) {
      try {
        await supabaseDb.upsert('profiles', {
          id: user.id,
          full_name: name,
        });
        await supabaseDb.upsert('user_preferences', {
          user_id: user.id,
        }, 'user_id');
      } catch (_e) {
        // Fallback store handles it
      }
    }

    return {
      user: {
        id: user?.id,
        name: name,
        email: email,
      },
      tokens: {
        accessToken: data.session?.access_token || '',
        refreshToken: data.session?.refresh_token || '',
      },
    };
  }

  /**
   * Login with email and password via Supabase Auth
   */
  async login({ email, password }) {
    if (email === 'demo@mindtonic.ai') {
      return {
        user: DEMO_USER,
        tokens: {
          accessToken: 'demo-token-mind-tonic-session-cse',
          refreshToken: 'demo-refresh-token-cse',
        },
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw ApiError.unauthorized('Invalid email or password. Click "Create one now" or use the 1-Click Demo Login.');
      }
      throw ApiError.unauthorized(error.message);
    }

    const user = data.user;
    return {
      user: {
        id: user.id,
        name: user.user_metadata?.name || user.email.split('@')[0],
        email: user.email,
      },
      tokens: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    };
  }

  /**
   * Refresh token via Supabase Auth
   */
  async refreshToken(refreshToken) {
    if (refreshToken === 'demo-refresh-token-cse') {
      return {
        tokens: {
          accessToken: 'demo-token-mind-tonic-session-cse',
          refreshToken: 'demo-refresh-token-cse',
        },
      };
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    return {
      tokens: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    };
  }

  /**
   * Invalidate session / logout
   */
  async logout(_userId) {
    try {
      await supabase.auth.signOut();
    } catch (_err) {
      // Ignore
    }
    return true;
  }

  /**
   * Get user profile by id from Supabase PostgreSQL tables
   */
  async getProfile(userId, userMeta = {}) {
    if (userId === DEMO_USER.id) {
      return {
        ...DEMO_USER,
        preferences: {
          workingHours: { start: '09:00', end: '18:00' },
          sleepHours: { start: '23:00', end: '07:00' },
          breakDuration: 15,
          timezone: 'Asia/Kolkata',
          theme: 'dark',
        },
      };
    }

    let profile = null;
    let prefs = null;

    try {
      profile = await supabaseDb.findOne('profiles', { id: userId });
      prefs = await supabaseDb.findOne('user_preferences', { user_id: userId });
    } catch (_e) {
      // Fallback
    }

    const full_name = profile?.full_name || userMeta.name || userMeta.full_name || 'User';
    const email = userMeta.email || '';

    return {
      id: userId,
      name: full_name,
      email: email,
      avatar: profile?.avatar_url || userMeta.avatar || null,
      college: profile?.college_name || '',
      semester: profile?.semester || 1,
      preferences: {
        workingHours: {
          start: prefs?.working_hours_start || '09:00',
          end: prefs?.working_hours_end || '18:00',
        },
        sleepHours: {
          start: prefs?.sleep_start || '23:00',
          end: prefs?.sleep_end || '07:00',
        },
        breakDuration: prefs?.break_duration ?? 15,
        timezone: prefs?.timezone || 'Asia/Kolkata',
        theme: prefs?.theme || 'dark',
      },
    };
  }

  /**
   * Update profile information and preferences in Supabase PostgreSQL
   */
  async updateProfile(userId, updateData) {
    const profileUpdates = {};
    if (updateData.name) profileUpdates.full_name = updateData.name;
    if (updateData.avatar !== undefined) profileUpdates.avatar_url = updateData.avatar;
    if (updateData.college) profileUpdates.college_name = updateData.college;
    if (updateData.semester) profileUpdates.semester = updateData.semester;

    if (Object.keys(profileUpdates).length > 0) {
      try {
        await supabaseDb.upsert('profiles', {
          id: userId,
          ...profileUpdates,
        });
      } catch (_e) {
        // Fallback
      }
    }

    if (updateData.preferences) {
      const p = updateData.preferences;
      const prefUpdates = { user_id: userId };
      if (p.workingHoursStart) prefUpdates.working_hours_start = p.workingHoursStart;
      if (p.workingHoursEnd) prefUpdates.working_hours_end = p.workingHoursEnd;
      if (p.sleepStart) prefUpdates.sleep_start = p.sleepStart;
      if (p.sleepEnd) prefUpdates.sleep_end = p.sleepEnd;
      if (p.breakDuration) prefUpdates.break_duration = p.breakDuration;
      if (p.timezone) prefUpdates.timezone = p.timezone;
      if (p.theme) prefUpdates.theme = p.theme;

      try {
        await supabaseDb.upsert('user_preferences', prefUpdates, 'user_id');
      } catch (_e) {
        // Fallback
      }
    }

    return this.getProfile(userId, { name: updateData.name, avatar: updateData.avatar });
  }

  /**
   * Change user password via Supabase Auth
   */
  async changePassword(_userId, _currentPassword, newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw ApiError.badRequest(error.message);
    }

    return {
      message: 'Password changed successfully',
      user: data.user,
    };
  }
}

module.exports = new AuthService();
