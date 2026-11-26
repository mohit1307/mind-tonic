/**
 * Standardized API response helpers.
 * All responses follow the envelope: { success, data?, message?, error?, pagination? }
 */

const success = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
  };
  if (data !== null && data !== undefined) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

const created = (res, data, message = 'Created successfully') => {
  return success(res, data, message, 201);
};

const paginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
};

const error = (res, statusCode = 500, message = 'Internal server error', errorCode = 'INTERNAL_ERROR', details = null) => {
  const response = {
    success: false,
    error: {
      code: errorCode,
      message,
    },
  };
  if (details) {
    response.error.details = details;
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  success,
  created,
  paginated,
  error,
};
