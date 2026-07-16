const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware'); 

// Apply protection to ALL routes in this file
router.use(protect); 

// GET /api/v1/users/me - Fetch own profile
router.get('/me', userController.getProfile);

// PUT /api/v1/users/me - Update profile (Onboarding)
router.put('/me', userController.updateProfile);

// PUT /api/v1/users/me/fcm - Update FCM Token
router.put('/me/fcm', userController.updateFcmToken);

// DELETE /api/v1/users/me - Delete account
router.delete('/me', userController.deleteAccount);

module.exports = router;