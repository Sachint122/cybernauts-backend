const express = require('express');
const authController = require('../controllers/authController');
const authValidator = require('../validators/authValidator');
const validate = require('../middlewares/validateMiddleware');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', validate(authValidator.register), authController.register);
router.post('/login', validate(authValidator.login), authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
