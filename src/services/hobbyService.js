const Hobby = require('../models/Hobby');
const ApiError = require('../utils/ApiError');

class HobbyService {
  async getAllHobbies(options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [hobbies, total] = await Promise.all([
      Hobby.find().skip(skip).limit(limit),
      Hobby.countDocuments()
    ]);

    return { hobbies, total, page, totalPages: Math.ceil(total / limit) };
  }

  async createHobby(data) {
    const existing = await Hobby.findOne({ name: data.name.toLowerCase() });
    if (existing) throw new ApiError(400, 'Hobby already exists');
    return await Hobby.create(data);
  }
}

module.exports = new HobbyService();
