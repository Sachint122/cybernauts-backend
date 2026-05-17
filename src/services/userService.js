const User = require('../models/User');
const Friendship = require('../models/Friendship');
const Hobby = require('../models/Hobby');
const ApiError = require('../utils/ApiError');

class UserService {
  async getAllUsers(options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().populate('hobbies').sort({ popularityScore: -1 }).skip(skip).limit(limit),
      User.countDocuments()
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getUserById(id) {
    const user = await User.findById(id).populate('hobbies');
    if (!user) throw new ApiError(404, 'User not found');

    // Fetch friends separately since they are in a different collection
    const friendships = await Friendship.find({
      $or: [{ requester: id }, { recipient: id }]
    });

    const friendIds = friendships.map(f => 
      f.requester.toString() === id.toString() ? f.recipient : f.requester
    );

    const friends = await User.find({ _id: { $in: friendIds } }).select('name email popularityScore');
    
    // Attach friends to the user object
    const userJson = user.toJSON();
    userJson.friends = friends;

    return userJson;
  }

  async updateUser(id, data) {
    if (data.hobbies && Array.isArray(data.hobbies)) {
      const hobbyIds = [];
      for (const hobbyName of data.hobbies) {
        if (typeof hobbyName === 'string' && hobbyName.match(/^[0-9a-fA-F]{24}$/)) {
          hobbyIds.push(hobbyName); // Already an ObjectId hex
        } else if (typeof hobbyName === 'string' && hobbyName.trim() !== '') {
          // Find or create by name case-insensitively
          let hobbyObj = await Hobby.findOne({ name: { $regex: new RegExp(`^${hobbyName.trim()}$`, 'i') } });
          if (!hobbyObj) {
            hobbyObj = await Hobby.create({ name: hobbyName.trim(), category: 'General' });
          }
          hobbyIds.push(hobbyObj._id);
        } else if (hobbyName && hobbyName.id) {
           hobbyIds.push(hobbyName.id);
        } else if (hobbyName && hobbyName._id) {
           hobbyIds.push(hobbyName._id);
        }
      }
      data.hobbies = hobbyIds;
    }

    const user = await User.findByIdAndUpdate(id, data, { new: true }).populate('hobbies');
    if (data.hobbies) await User.updatePopularityScore(id);
    return user;
  }

  async deleteUser(id) {
    const friendCount = await Friendship.countDocuments({
      $or: [{ requester: id }, { recipient: id }]
    });
    
    if (friendCount > 0) {
      throw new ApiError(400, 'Cannot delete user with active friendships. Unlink them first.');
    }

    return await User.findByIdAndDelete(id);
  }
}

module.exports = new UserService();
