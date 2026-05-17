const ApiError = require('../utils/ApiError');

/**
 * Global Error Handler Middleware
 * Standardizes all error responses from the server
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle Mongoose cast error (e.g. invalid mapping of _id)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Data validation failed';
    errors = Object.values(err.errors).map(e => e.message);
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    errors = [`Duplicate value for field: ${field}`];
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  const response = {
    success: false,
    statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined,
  };

  // Add stack trace only in development mode
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    console.error(`[ERROR] ${message}`, err);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
