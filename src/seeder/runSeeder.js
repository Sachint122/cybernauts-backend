require('dotenv').config();
const connectDB = require('../config/db');
const { seedData } = require('./seeder');
const mongoose = require('mongoose');

const runSeeder = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting seeder execution...');
    await seedData();
    console.log('✅ Seeding process finished successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder encountered an error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runSeeder();
