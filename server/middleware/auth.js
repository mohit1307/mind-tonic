const { supabase } = require('../config/supabase');
const ApiError = require('../utils/apiError');

/**
 * Supabase JWT authentication middleware with placement demo & admin support.
 * Validates the Bearer token with Supabase Auth (or demo session) and attaches user data to req.user.
 */
const auth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No authorization token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('No authorization token provided');
    }

    // 1. Support admin demo session
    if (token.startsWith('admin-token')) {
      req.user = {
        id: 'a0000000-0000-0000-0000-000000000001',
        email: 'admin@mindtonic.ai',
        name: 'System Admin',
        avatar: null,
        role: 'admin',
      };
      return next();
    }

    // 2. Support placement demo reviewer session
    if (token.startsWith('demo-token')) {
      req.user = {
        id: 'd3b07384-d113-40f2-b8bb-32e650d03704',
        email: 'demo@mindtonic.ai',
        name: 'Demo Student',
        avatar: null,
        college: 'CSE Placement Portfolio',
        semester: 8,
        role: 'user',
      };
      return next();
    }

    // 3. Verify token with Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      throw ApiError.unauthorized('Invalid or expired Supabase authentication token');
    }

    const user = data.user;
    const role =
      user.email === 'admin@mindtonic.ai' || user.user_metadata?.role === 'admin'
        ? 'admin'
        : user.user_metadata?.role || 'user';

    req.user = {
      id: user.id,
      email: user.email,
      name:
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'User',
      avatar: user.user_metadata?.avatar_url || null,
      role,
      ...user.user_metadata,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(ApiError.unauthorized(error.message || 'Authentication required'));
  }
};

/**
 * Role-Based Access Control middleware for administrator access
 */
const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin' && req.user?.email !== 'admin@mindtonic.ai') {
    throw ApiError.forbidden('Access denied. Administrator privileges required.');
  }
  next();
};

auth.authenticate = auth;
auth.auth = auth;
auth.requireAdmin = requireAdmin;

module.exports = auth;
