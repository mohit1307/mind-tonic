const { supabase } = require('../config/supabase');
const ApiError = require('../utils/apiError');

/**
 * Supabase JWT authentication middleware.
 * Validates the Bearer token with Supabase Auth and attaches user data to req.user.
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

    // Verify token with Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      throw ApiError.unauthorized('Invalid or expired Supabase authentication token');
    }

    const user = data.user;
    req.user = {
      id: user.id,
      email: user.email,
      name:
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'User',
      avatar: user.user_metadata?.avatar_url || null,
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

auth.authenticate = auth;
auth.auth = auth;

module.exports = auth;
