const recommendationService = require('../services/recommendationService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get recommendations for a user
 * GET /api/users/:id/recommendations
 */
exports.getRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await recommendationService.getRecommendations(req.params.id||req.user._id);
  res.status(200).json(new ApiResponse(200, recommendations, 'Recommendations retrieved successfully'));
});

/**
 * Record feedback for a recommendation
 * POST /api/users/:id/recommendations/feedback
 */
exports.recordFeedback = asyncHandler(async (req, res) => {
  const feedback = await recommendationService.recordFeedback(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, { feedback }, 'Recommendation feedback recorded successfully'));
});
