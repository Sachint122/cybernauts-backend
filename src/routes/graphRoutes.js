const express = require('express');
const friendshipController = require('../controllers/friendshipController');

const router = express.Router();

router.get('/', friendshipController.getGraph);

module.exports = router;
