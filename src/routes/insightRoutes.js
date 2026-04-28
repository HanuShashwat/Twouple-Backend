const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

// GET /api/v1/insights/daily?date=2024-05-20
router.get('/daily', insightController.getDailyData);

// PATCH /api/v1/insights/tasks/:taskId/toggle
router.patch('/tasks/:taskId/toggle', insightController.toggleTask);

module.exports = router;