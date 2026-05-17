const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');

class AuthService {
  async register(userData) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) throw new ApiError(400, 'Email already registered');

    const user = await User.create(userData);
    const token = this.generateToken(user);
    return { user, token };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'User not found');
    }
    if (!(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async getMe(userId) {
    const user = await User.findById(userId).populate('hobbies');
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }

  generateToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  }
}

module.exports = new AuthService();
