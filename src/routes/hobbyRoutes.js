const express = require('express');
const hobbyController = require('../controllers/hobbyController');

const router = express.Router();

router.get('/', hobbyController.getHobbies);
router.post('/', hobbyController.createHobby);

module.exports = router;
