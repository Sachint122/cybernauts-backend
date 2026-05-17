const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const graphRoutes = require('./graphRoutes');
const hobbyRoutes = require('./hobbyRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/graph', graphRoutes);
router.use('/hobbies', hobbyRoutes);

module.exports = router;
