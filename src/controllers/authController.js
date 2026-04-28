const authService = require('../services/authService');

exports.requestOtp = async (req, res) => {
  try {
    const { phone_number } = req.body;
    
    // Basic structural validation
    if (!phone_number || typeof phone_number !== 'string' || phone_number.length < 10) {
      return res.status(400).json({ success: false, message: 'A valid phone number is required.' });
    }

    const result = await authService.processOtpRequest(phone_number);
    return res.status(200).json(result);

  } catch (error) {
    console.error('[OTP Request Failed]:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during OTP request.' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;

    if (!phone_number || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP are mandatory.' });
    }

    const authData = await authService.verifyAndProvisionUser(phone_number, otp);
    
    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: authData
    });

  } catch (error) {
    if (error.message === 'Invalid OTP') {
      return res.status(401).json({ success: false, message: error.message });
    }
    console.error('[Verification Failed]:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during verification.' });
  }
};