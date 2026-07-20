const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Extract token from the Bearer header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    // 2. Verify cryptographically
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Verify user still exists in the database (Crucial Security Step)
    const currentUser = await User.findByPk(decoded.id, {
      attributes: ['id', 'phone_number', 'is_premium'] // Only attach what's needed to the request
    });

    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'The user belonging to this token no longer exists.' });
    }

    // 4. Attach user to request and proceed
    req.user = currentUser;
    next();
  } catch (error) {
    console.error('[Auth Error]:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

const requirePremium = (req, res, next) => {
  if (req.user && req.user.is_premium) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'This feature requires a Premium subscription.',
      code: 'PREMIUM_REQUIRED'
    });
  }
};

module.exports = { protect, requirePremium };