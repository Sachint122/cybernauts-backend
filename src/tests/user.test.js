const User = require('../models/User');
const Hobby = require('../models/Hobby');
const Friendship = require('../models/Friendship');
const userService = require('../services/userService');
const friendshipService = require('../services/friendshipService');
require('./setup');

describe('User Business Rules', () => {
  let user1, user2, hobby;

  beforeEach(async () => {
    hobby = await Hobby.create({ name: 'Coding', category: 'Tech' });
    user1 = await User.create({ name: 'User 1', email: 'u1@test.com', password: 'password123', hobbies: [hobby._id] });
    user2 = await User.create({ name: 'User 2', email: 'u2@test.com', password: 'password123', hobbies: [hobby._id] });
  });

  test('Should block user deletion if linked', async () => {
    // Link users
    await friendshipService.linkUsers(user1._id, user2._id);

    // Try to delete user1
    await expect(userService.deleteUser(user1._id)).rejects.toThrow(/active friendships/);
    
    // Unlink then delete
    await friendshipService.unlinkUsers(user1._id, user2._id);
    const deleted = await userService.deleteUser(user1._id);
    expect(deleted).toBeDefined();
  });

  test('Should calculate popularity score correctly', async () => {
    /**
     * Rules: number of friends + (shared hobbies with friends * 0.5)
     * user1 has 1 hobby (Coding)
     * user2 has 1 hobby (Coding)
     * They link: 
     * friends = 1
     * shared hobbies = 1 (Coding)
     * score = 1 + (1 * 0.5) = 1.5
     */
    await friendshipService.linkUsers(user1._id, user2._id);
    
    const updatedUser1 = await User.findById(user1._id);
    expect(updatedUser1.popularityScore).toBe(1.5);

    const updatedUser2 = await User.findById(user2._id);
    expect(updatedUser2.popularityScore).toBe(1.5);
  });
});
