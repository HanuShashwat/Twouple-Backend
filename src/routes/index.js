const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const relationshipRoutes = require('./relationshipRoutes');
const insightRoutes = require('./insightRoutes');
const chatRoutes = require('./chatRoutes'); // Add to imports

// Mount the feature routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/relationships', relationshipRoutes);
router.use('/insights', insightRoutes);
router.use('/chat', chatRoutes); // Add to the mounted routes


module.exports = router;