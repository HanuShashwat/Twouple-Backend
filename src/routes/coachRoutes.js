const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const { protect } = require('../middlewares/authMiddleware');
const { strictLimiter } = require('../middlewares/rateLimiter');

// All coach routes require authentication
router.use(protect);

// POST /api/v1/coach/send - Send a message to Aura (rate-limited to prevent API bill explosion)
router.post('/send', strictLimiter, coachController.send);

// GET /api/v1/coach/history - Get paginated coach chat history
router.get('/history', coachController.getHistory);

module.exports = router;
