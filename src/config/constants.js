module.exports = {
  JWT_EXPIRES_IN: '24h',
  SALT_ROUNDS: 10,
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
  },
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100 // 100 requests per window
  }
};
