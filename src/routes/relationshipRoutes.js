const express = require('express');
const router = express.Router();
const relationshipController = require('../controllers/relationshipController');
const { protect } = require('../middlewares/authMiddleware');

// Lock down all relationship routes
router.use(protect);

// POST /api/v1/relationships/invite
router.post('/invite', relationshipController.invite);

// GET /api/v1/relationships/status
router.get('/status', relationshipController.getStatus);

// POST /api/v1/relationships/accept (We added this for the partner to say "Yes")
router.post('/accept', relationshipController.accept);

module.exports = router;