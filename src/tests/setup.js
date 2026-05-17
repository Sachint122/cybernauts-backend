const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

beforeAll(async () => {
  const url = process.env.MONGO_URI;
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});
