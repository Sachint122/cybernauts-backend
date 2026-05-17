const hobbyService = require('../services/hobbyService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get all hobbies with pagination
 * GET /api/hobbies
 */
exports.getHobbies = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  const result = await hobbyService.getAllHobbies({ page, limit });
  res.status(200).json(new ApiResponse(200, result, 'Hobbies retrieved successfully'));
});

/**
 * Create hobby
 * POST /api/hobbies
 */
exports.createHobby = asyncHandler(async (req, res) => {
  const hobby = await hobbyService.createHobby(req.body);
  res.status(201).json(new ApiResponse(201, { hobby }, 'Hobby created successfully'));
});
