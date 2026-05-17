const User = require('../models/User');
const Hobby = require('../models/Hobby');
const Friendship = require('../models/Friendship');
const RecommendationFeedback = require('../models/RecommendationFeedback');

class RecommendationEngine {
  async getTopFriendRecommendations(userId) {
    const user = await User.findById(userId).populate('hobbies');
    if (!user) return [];

    const friendIds = await this.getFriendIds(userId);
    const candidateUsers = await User.find({ 
      _id: { $nin: [...friendIds, userId] } 
    }).populate('hobbies').limit(50);

    const feedbacks = await RecommendationFeedback.find({ userId });

    const recommendations = await Promise.all(candidateUsers.map(async (candidate) => {
      let score = 0;
      const signals = [];

      // 1. Mutual Friends
      const candidateFriends = await this.getFriendIds(candidate._id);
      const mutualFriends = friendIds.filter(id => candidateFriends.includes(id));
      if (mutualFriends.length > 0) {
        score += mutualFriends.length * 3;
        signals.push({ type: 'MUTUAL_FRIENDS', count: mutualFriends.length });
      }

      // 2. Shared Hobbies
      const sharedHobbies = candidate.hobbies.filter(h => 
        user.hobbies.some(uh => uh._id.toString() === h._id.toString())
      );
      if (sharedHobbies.length > 0) {
        score += sharedHobbies.length * 4; // Increased weight for shared hobbies
        signals.push({ type: 'SHARED_HOBBIES', count: sharedHobbies.length });
      }

      // 3. Feedback
      const feedback = feedbacks.find(f => f.targetId.toString() === candidate._id.toString());
      if (feedback) {
        score += (feedback.action === 'ACCEPT' ? 5 : -10);
        signals.push({ type: 'FEEDBACK', action: feedback.action });
      }

      // 4. Popularity
      score += (candidate.popularityScore || 0) * 0.1;

      return {
        id: candidate._id,
        name: candidate.name,
        score: parseFloat(Math.max(0, score).toFixed(2)),
        reason: this.generateReason(mutualFriends, sharedHobbies),
        sourceSignals: signals
      };
    }));

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  async getTopHobbyRecommendations(userId) {
    const user = await User.findById(userId).populate('hobbies');
    if (!user) return [];

    const allHobbies = await Hobby.find();
    const userHobbyIds = user.hobbies.map(h => h._id.toString());
    const candidateHobbies = allHobbies.filter(h => !userHobbyIds.includes(h._id.toString()));

    return candidateHobbies.map(hobby => {
      let score = 0;
      const categoryMatch = user.hobbies.find(uh => uh.category === hobby.category);
      if (categoryMatch) score += 5;

      return {
        id: hobby._id,
        name: hobby.name,
        score: Math.max(0, score),
        reason: categoryMatch ? `Based on your interest in ${categoryMatch.name} (${hobby.category})` : 'Popular in your network',
        sourceSignals: categoryMatch ? [{ type: 'CATEGORY_MATCH', category: hobby.category }] : []
      };
    }).sort((a, b) => b.score - a.score).slice(0, 5);
  }

  async getFriendIds(userId) {
    const friendships = await Friendship.find({ $or: [{ requester: userId }, { recipient: userId }] });
    return friendships.map(f => f.requester.toString() === userId.toString() ? f.recipient.toString() : f.requester.toString());
  }

  generateReason(mutual, sharedHobbies) {
    if (sharedHobbies.length > 0) {
      const hobbyNames = sharedHobbies.map(h => h.name);
      if (hobbyNames.length === 1) return `Both are interested in ${hobbyNames[0]}.`;
      return `Shared interests in ${hobbyNames.slice(0, 2).join(' and ')}.`;
    }
    if (mutual.length > 0) return `You have ${mutual.length} mutual friends.`;
    return "Recommended based on network activity.";
  }
}

module.exports = new RecommendationEngine();
