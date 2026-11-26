const ApiError = require('../utils/apiError');
const apiResponse = require('../utils/apiResponse');

/**
 * Global error handling middleware.
 * Catches all errors and returns a consistent JSON response.
 */
const errorHandler = (err, req, res, _next) => {
  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err.message);
    if (err.stack && !(err instanceof ApiError)) {
      console.error(err.stack);
    }
  }

  // Handle our custom ApiError
  if (err instanceof ApiError) {
    return apiResponse.error(
      res,
      err.statusCode,
      err.message,
      err.errorCode,
      err.details
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return apiResponse.error(res, 422, 'Validation failed', 'VALIDATION_ERROR', details);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return apiResponse.error(
      res,
      409,
      `${field} already exists`,
      'DUPLICATE_KEY',
      { field, value: err.keyValue[field] }
    );
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return apiResponse.error(res, 400, `Invalid ${err.path}: ${err.value}`, 'INVALID_ID');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return apiResponse.error(res, 401, 'Invalid token', 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return apiResponse.error(res, 401, 'Token expired', 'TOKEN_EXPIRED');
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return apiResponse.error(res, 400, 'File too large', 'FILE_TOO_LARGE');
  }

  // CORS error
  if (err.message && err.message.includes('CORS')) {
    return apiResponse.error(res, 403, err.message, 'CORS_ERROR');
  }

  // Default: internal server error
  return apiResponse.error(
    res,
    500,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    'INTERNAL_ERROR'
  );
};

/**
 * 404 handler for unmatched routes.
 */
const notFoundHandler = (req, res) => {
  return apiResponse.error(res, 404, `Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND');
};

module.exports = { errorHandler, notFoundHandler };
