const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check Cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Check Authorization Header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Please login to access this resource');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      throw new ApiError(401, 'User no longer exists');
    }

    next();
  } catch (error) {
    next(new ApiError(401, error.message || 'Authentication failed'));
  }
};

const checkOwnership = (req, res, next) => {
  // Ensure the user is trying to modify their own account
  // req.params.id is the target account ID from the URL route
  if (req.user._id.toString() !== req.params.id) {
    return next(new ApiError(403, 'Forbidden: You can only manage your own account details and connections'));
  }
  next();
};

module.exports = { protect, checkOwnership };
