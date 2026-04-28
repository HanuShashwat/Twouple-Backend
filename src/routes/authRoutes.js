const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/v1/auth/request-otp
router.post('/request-otp', authController.requestOtp);

// POST /api/v1/auth/verify-otp
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;