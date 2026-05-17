const recommendationEngine = require('../recommendation/engine');
const RecommendationFeedback = require('../models/RecommendationFeedback');
const ApiError = require('../utils/ApiError');

class RecommendationService {
  async getRecommendations(userId) {
    const [friends, hobbies] = await Promise.all([
      recommendationEngine.getTopFriendRecommendations(userId),
      recommendationEngine.getTopHobbyRecommendations(userId)
    ]);

    return { friendRecommendations: friends, hobbyRecommendations: hobbies };
  }

  async recordFeedback(userId, data) {
    const { targetId, targetType, action } = data;
    if (!['USER', 'HOBBY'].includes(targetType)) throw new ApiError(400, 'Invalid target type');
    
    return await RecommendationFeedback.findOneAndUpdate(
      { userId, targetId },
      { userId, targetId, targetType, action },
      { upsert: true, new: true }
    );
  }
}

module.exports = new RecommendationService();
