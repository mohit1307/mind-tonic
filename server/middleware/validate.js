const ApiError = require('../utils/apiError');

/**
 * Joi validation middleware factory.
 * Usage: validate(schema) or validate(schema, 'query')
 *
 * @param {Object} schema - Joi schema object
 * @param {string} source - Request property to validate ('body', 'query', 'params')
 */
const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));
      return next(ApiError.validation('Validation failed', details));
    }

    // Replace request data with validated and sanitized values
    req[source] = value;
    next();
  };
};

module.exports = validate;
