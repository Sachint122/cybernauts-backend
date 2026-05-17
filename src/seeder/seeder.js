const { faker } = require('@faker-js/faker');
const User = require('../models/User');
const Hobby = require('../models/Hobby');
const Friendship = require('../models/Friendship');
const RecommendationFeedback = require('../models/RecommendationFeedback');

const REALISTIC_HOBBIES = [
  { name: "Backend Development", category: "Technology" },
  { name: "Node.js", category: "Technology" },
  { name: "React", category: "Technology" },
  { name: "AI", category: "Technology" },
  { name: "Machine Learning", category: "Technology" },
  { name: "Football", category: "Sports" },
  { name: "Cricket", category: "Sports" },
  { name: "Photography", category: "Arts" },
  { name: "Music", category: "Music" },
  { name: "Gaming", category: "Gaming" },
  { name: "Cooking", category: "Cooking" },
  { name: "Travel", category: "Outdoors" },
  { name: "Gym", category: "Fitness" },
  { name: "Reading", category: "Education" },
  { name: "Anime", category: "Entertainment" },
  { name: "UI/UX Design", category: "Design" },
  { name: "Docker", category: "Technology" },
  { name: "Cyber Security", category: "Technology" },
  { name: "Chess", category: "Gaming" },
  { name: "Blogging", category: "Content" }
];

const seedData = async () => {
  try {
    console.log('🧹 Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Hobby.deleteMany({}),
      Friendship.deleteMany({}),
      RecommendationFeedback.deleteMany({})
    ]);

    console.log('📚 Inserting realistic hobbies...');
    const insertedHobbies = await Hobby.insertMany(REALISTIC_HOBBIES);
    const hobbyIds = insertedHobbies.map(h => h._id);

    console.log('👥 Creating 50 realistic users...');
    const createdUsers = [];
    for (let i = 0; i < 50; i++) {
      const user = await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        hobbies: faker.helpers.arrayElements(hobbyIds, { min: 2, max: 4 })
      });
      createdUsers.push(user);
    }

    console.log('🔗 Creating friendships...');
    for (let i = 0; i < 100; i++) {
      const u1 = faker.helpers.arrayElement(createdUsers);
      const u2 = faker.helpers.arrayElement(createdUsers);
      if (u1._id.toString() !== u2._id.toString()) {
        await Friendship.create({ requester: u1._id, recipient: u2._id }).catch(() => { });
      }
    }

    console.log('📈 Calculating scores...');
    for (const user of createdUsers) {
      await User.updatePopularityScore(user._id);
    }

    return { users: createdUsers.length, hobbies: insertedHobbies.length };
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

module.exports = { seedData };
