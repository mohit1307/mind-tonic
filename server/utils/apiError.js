/**
 * Custom API Error class for consistent error handling.
 * Extends the native Error with HTTP status codes and error codes.
 */
class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static conflict(message, details = null) {
    return new ApiError(409, message, 'CONFLICT', details);
  }

  static validation(message, details = null) {
    return new ApiError(422, message, 'VALIDATION_ERROR', details);
  }

  static tooMany(message = 'Too many requests, please try again later') {
    return new ApiError(429, message, 'RATE_LIMIT_EXCEEDED');
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}

module.exports = ApiError;
