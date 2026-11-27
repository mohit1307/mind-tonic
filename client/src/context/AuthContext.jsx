import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { supabase } from '../services/supabaseClient';

export const AuthContext = createContext(null);

const DEMO_USER = {
  id: 'd3b07384-d113-40f2-b8bb-32e650d03704',
  name: 'Demo Student',
  email: 'demo@mindtonic.ai',
  college: 'CSE Placement Portfolio',
  semester: 8,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from token / Supabase session
  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Check demo session token
      if (token.startsWith('demo-token')) {
        try {
          const profile = await authService.getMe();
          setUser(profile || DEMO_USER);
        } catch (_e) {
          setUser(DEMO_USER);
        }
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      localStorage.setItem('accessToken', session.access_token);
      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
      } catch (err) {
        console.warn('Backend profile fetch note:', err.message);
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          email: session.user.email,
        });
      }
    } catch (err) {
      console.warn('Auth session check error:', err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    // Listen for Supabase auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const token = localStorage.getItem('accessToken');
      if (token?.startsWith('demo-token')) return;

      if (event === 'SIGNED_IN' && session) {
        localStorage.setItem('accessToken', session.access_token);
        try {
          const currentUser = await authService.getMe();
          setUser(currentUser);
        } catch (_err) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            email: session.user.email,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [loadUser]);

  const login = async (credentials) => {
    setError(null);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (updates) => {
    setError(null);
    try {
      const updatedUser = await authService.updateProfile(updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const changePassword = async (passwords) => {
    setError(null);
    return await authService.changePassword(passwords);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
