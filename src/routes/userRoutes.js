const express = require('express');
const userController = require('../controllers/userController');
const friendshipController = require('../controllers/friendshipController');
const recommendationController = require('../controllers/recommendationController');
const userValidator = require('../validators/userValidator');
const friendshipValidator = require('../validators/friendshipValidator');
const recommendationValidator = require('../validators/recommendationValidator');
const validate = require('../middlewares/validateMiddleware');
const { protect, checkOwnership } = require('../middlewares/authMiddleware');

const router = express.Router();

// User CRUD
router.get('/', protect, userController.getUsers);
router.get('/:id', protect, userController.getUser);

router.put('/:id', protect, checkOwnership, validate(userValidator.updateUser), userController.updateUser);
router.delete('/:id', protect, checkOwnership, userController.deleteUser);

// Friendship linking
router.post('/:id/link', protect, checkOwnership, validate(friendshipValidator.link), friendshipController.linkUsers);
router.delete('/:id/unlink', protect, checkOwnership, validate(friendshipValidator.link), friendshipController.unlinkUsers);

// Recommendations
router.get('/:id?/recommendations', protect, recommendationController.getRecommendations);
router.post('/:id/recommendations/feedback', protect, checkOwnership, validate(recommendationValidator.feedback), recommendationController.recordFeedback);

module.exports = router;
