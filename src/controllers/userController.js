const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get all users with pagination
 * GET /api/users
 */
exports.getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  const result = await userService.getAllUsers({ page, limit });
  res.status(200).json(new ApiResponse(200, result, 'Users retrieved successfully'));
});

/**
 * Get single user
 * GET /api/users/:id
 */
exports.getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, user, 'User retrieved successfully'));
});



/**
 * Update user
 * PUT /api/users/:id
 */
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { user }, 'User updated successfully'));
});

/**
 * Delete user
 * DELETE /api/users/:id
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
});
