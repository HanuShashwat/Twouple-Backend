const Joi = require('joi');
const userService = require('../services/userService');

// Fetch Profile
exports.getProfile = async (req, res) => {
  try {
    // req.user.id comes from the Auth Middleware!
    const user = await userService.getUserById(req.user.id);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.message === 'User not found') return res.status(404).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update Profile (The Onboarding Endpoint)
exports.updateProfile = async (req, res) => {
  // 1. Define Strict Validation Rules
  const updateSchema = Joi.object({
    full_name: Joi.string().min(2).max(100).optional(),
    dob: Joi.date().iso().optional(), // Must be YYYY-MM-DD
    time_of_birth: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).optional(), // Must be HH:MM
    place_of_birth: Joi.string().max(255).optional(),
    zodiac_sign: Joi.string().valid('Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces').optional()
  });

  // 2. Validate incoming request body
  const { error, value } = updateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: `Validation Error: ${error.details[0].message}` });
  }

  // 3. Execute Update
  try {
    const updatedUser = await userService.updateUser(req.user.id, value);
    return res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: updatedUser 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update profile', error: err.message });
  }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    await userService.deleteUser(req.user.id);
    return res.status(200).json({ success: true, message: 'Account permanently deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
};

// Update FCM Token
exports.updateFcmToken = async (req, res) => {
  const { fcm_token } = req.body;
  if (!fcm_token) {
    return res.status(400).json({ success: false, message: 'fcm_token is required' });
  }

  try {
    const updatedUser = await userService.updateUser(req.user.id, { fcm_token });
    return res.status(200).json({ success: true, message: 'FCM token updated', data: updatedUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update FCM token', error: err.message });
  }
};