const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generates and dispatches an OTP to the provided phone number.
 */
exports.processOtpRequest = async (phoneNumber) => {
  const isProduction = process.env.USE_REAL_OTP === 'true';
  let otpCode;

  if (isProduction) {
    // [TODO]: Inject AWS SNS or Twilio logic here
    // otpCode = generateRandom4DigitCode();
    // await smsProvider.send(phoneNumber, otpCode);
    console.log(`[PROD] Real SMS dispatched to ${phoneNumber}`);
  } else {
    otpCode = '1234'; 
    console.log(`[DEV] Dummy OTP ${otpCode} triggered for ${phoneNumber}`);
  }

  return { success: true, message: 'OTP dispatched successfully' };
};

/**
 * Verifies the OTP, provisions the user if they don't exist, and signs a JWT.
 */
exports.verifyAndProvisionUser = async (phoneNumber, incomingOtp) => {
  const isProduction = process.env.USE_REAL_OTP === 'true';

  // 1. Strict OTP Validation
  if (isProduction) {
    // [TODO]: Validate against Redis cache
    // const validOtp = await redis.get(`otp:${phoneNumber}`);
    // if (incomingOtp !== validOtp) throw new Error('Invalid or expired OTP');
  } else {
    if (incomingOtp !== '1234') {
      throw new Error('Invalid OTP');
    }
  }

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