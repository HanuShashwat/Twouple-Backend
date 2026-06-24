const jwt = require('jsonwebtoken');
const User = require('../models/User');
const twilio = require('twilio');

// In-memory OTP store (in production, use Redis for multi-instance deployments)
const otpCache = new Map();
// Structure: otpCache.set(phoneNumber, { otp: '1234', expires: Date.now() + 5 * 60000 })

/**
 * Generates and dispatches an OTP to the provided phone number.
 */
exports.processOtpRequest = async (phoneNumber) => {
  const isProduction = process.env.USE_REAL_OTP === 'true';
  let otpCode;

  if (isProduction) {
    otpCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    try {
      await client.messages.create({
        body: `Your Twouple verification code is: ${otpCode}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      console.log(`[PROD] Real SMS dispatched to ${phoneNumber}`);
    } catch (err) {
      console.error('[Twilio Error]:', err.message);
      throw new Error('Failed to send SMS. Please check the phone number.');
    }
  } else {
    otpCode = '1234'; 
    console.log(`[DEV] Dummy OTP ${otpCode} triggered for ${phoneNumber}`);
  }

  // Store OTP with 5-minute expiration
  otpCache.set(phoneNumber, { 
    otp: otpCode, 
    expires: Date.now() + 5 * 60 * 1000 
  });

  return { success: true, message: 'OTP dispatched successfully' };
};

/**
 * Verifies the OTP, provisions the user if they don't exist, and signs a JWT.
 */
exports.verifyAndProvisionUser = async (phoneNumber, incomingOtp) => {
  const cachedData = otpCache.get(phoneNumber);
  
  if (!cachedData) {
    throw new Error('OTP expired or not requested');
  }

  if (Date.now() > cachedData.expires) {
    otpCache.delete(phoneNumber);
    throw new Error('OTP has expired');
  }

  if (incomingOtp !== cachedData.otp) {
    throw new Error('Invalid OTP');
  }

  // OTP is valid, clear it from cache
  otpCache.delete(phoneNumber);

  // 2. Database Transaction: Find or Provision
  const [user, created] = await User.findOrCreate({
    where: { phone_number: phoneNumber },
    defaults: { phone_number: phoneNumber }
  });

  // 3. Issue Cryptographic Token
  const token = jwt.sign(
    { id: user.id }, 
    process.env.JWT_SECRET,
    { expiresIn: '30d' } // Extended lifecycle for frictionless mobile UX
  );

  return { 
    token, 
    isNewUser: created, 
    user: { id: user.id, phone_number: user.phone_number, is_premium: user.is_premium } 
  };
};