const mongoose = require('mongoose');
const User = require('../models/User');
const Friendship = require('../models/Friendship');
require('./setup');

describe('Friendship Business Rules', () => {
  let user1, user2;

  beforeEach(async () => {
    user1 = await User.create({ name: 'User 1', email: 'u1@test.com', password: 'password123' });
    user2 = await User.create({ name: 'User 2', email: 'u2@test.com', password: 'password123' });
  });

  test('Should prevent self-linking', async () => {
    const selfLink = new Friendship({ requester: user1._id, recipient: user1._id });
    await expect(selfLink.save()).rejects.toThrow();
  });

  test('Should prevent duplicate friendships (A->B and B->A)', async () => {
    // A -> B
    await Friendship.create({ requester: user1._id, recipient: user2._id });

    // Try A -> B again
    const duo1 = new Friendship({ requester: user1._id, recipient: user2._id });
    await expect(duo1.save()).rejects.toThrow();

    // Try B -> A (should also fail because of the sorting logic in pre-save)
    const duo2 = new Friendship({ requester: user2._id, recipient: user1._id });
    await expect(duo2.save()).rejects.toThrow();
  });
});
