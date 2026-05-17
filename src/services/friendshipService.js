const Friendship = require('../models/Friendship');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class FriendshipService {
  async linkUsers(id1, id2) {
    if (id1 === id2) throw new ApiError(400, 'Cannot link with self');

    const existing = await Friendship.findOne({
      $or: [
        { requester: id1, recipient: id2 },
        { requester: id2, recipient: id1 }
      ]
    });
    if (existing) throw new ApiError(400, 'Already linked');

    const friendship = await Friendship.create({ requester: id1, recipient: id2 });

    await Promise.all([
      User.updatePopularityScore(id1),
      User.updatePopularityScore(id2)
    ]);

    return friendship;
  }

  async unlinkUsers(id1, id2) {
    const deleted = await Friendship.findOneAndDelete({
      $or: [
        { requester: id1, recipient: id2 },
        { requester: id2, recipient: id1 }
      ]
    });
    if (!deleted) throw new ApiError(404, 'Friendship not found');

    await Promise.all([
      User.updatePopularityScore(id1),
      User.updatePopularityScore(id2)
    ]);

    return ;
  }

  async getGraph() {
    const [users, friendships] = await Promise.all([
      User.find({}, 'name popularityScore hobbies').populate('hobbies', 'name'),
      Friendship.find({}, 'requester recipient')
    ]);

    return {
      nodes: users.map(u => ({
        id: u._id,
        name: u.name,
        popularityScore: u.popularityScore,
        hobbies: u.hobbies.map(h => h.name)
      })),
      edges: friendships.map(f => ({
        source: f.requester,
        target: f.recipient
      }))
    };
  }
}

module.exports = new FriendshipService();
