const friendshipService = require('../services/friendshipService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Link two users
 * POST /api/users/:id/link
 */
exports.linkUsers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { targetId } = req.body;
  const friendship = await friendshipService.linkUsers(id, targetId);
  res.status(200).json(new ApiResponse(200, { friendship }, 'Users linked successfully'));
});

/**
 * Unlink two users
 * DELETE /api/users/:id/unlink
 */
exports.unlinkUsers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { targetId } = req.body;
  const result = await friendshipService.unlinkUsers(id, targetId);
  res.status(200).json(new ApiResponse(200, result, 'Users unlinked successfully'));
});

/**
 * Get social graph
 * GET /api/graph
 */
exports.getGraph = asyncHandler(async (req, res) => {
  const graph = await friendshipService.getGraph();
  res.status(200).json(new ApiResponse(200, graph, 'Social graph retrieved successfully'));
});
