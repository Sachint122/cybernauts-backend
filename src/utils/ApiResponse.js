/**
 * Standard API Response Class
 * Ensures consistent response format across all endpoints
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {any} data - Response payload (object, array, or string as message)
   * @param {string} message - Optional custom message
   */
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    
    // If second param is a string AND no third param provided, 
    // treat second param as the message and set data to null
    if (typeof data === 'string' && arguments.length === 2) {
      this.message = data;
      this.data = null;
    } else {
      this.message = message;
      this.data = data;
    }
  }
}

module.exports = ApiResponse;
