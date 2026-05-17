/**
 * Higher-order function to handle asynchronous express routes and middleware
 * Eliminates the need for try-catch blocks in every controller
 * 
 * @param {Function} fn - Asynchronous function to wrap
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
