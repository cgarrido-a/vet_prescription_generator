const { logger } = require('../config/logger');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error: ${error.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique constraint violation
        error.message = 'Duplicate entry found';
        error.statusCode = 400;
        break;
      case '23503': // Foreign key constraint violation
        error.message = 'Referenced record not found';
        error.statusCode = 400;
        break;
      case '23502': // Not null constraint violation
        error.message = 'Required field missing';
        error.statusCode = 400;
        break;
      case '22001': // String data too long
        error.message = 'Data too long for field';
        error.statusCode = 400;
        break;
      default:
        error.message = 'Database error';
        error.statusCode = 500;
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error.message = message;
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Don't expose stack traces in production
  const response = {
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };