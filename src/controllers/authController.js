const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite:
      process.env.NODE_ENV === 'production'
        ? 'none'
        : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });
};

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  setCookie(res, result.token);
  res.status(201).json(new ApiResponse(201, result, 'Registered successfully'));
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  setCookie(res, result.token);
  res.status(200).json(new ApiResponse(200, result, 'Login successful'));
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.status(200).json(new ApiResponse(200, { user }, 'Profile retrieved'));
});
