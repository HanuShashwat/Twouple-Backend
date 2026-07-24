const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/v1/payments/revenuecat-webhook
router.post('/revenuecat-webhook', async (req, res) => {
  try {
    const { event } = req.body;
    if (!event) return res.status(400).send('No event data');

    const appUserId = event.app_user_id; // Usually mapped to our internal User ID
    const type = event.type; // e.g., INITIAL_PURCHASE, CANCELLATION, RENEWAL

    const user = await User.findByPk(appUserId);
    if (!user) {
      console.warn(`[Webhook] User ${appUserId} not found for event ${type}`);
      return res.status(200).send('OK'); // Return 200 so RevenueCat doesn't retry infinitely
    }

    if (type === 'INITIAL_PURCHASE' || type === 'RENEWAL') {
      user.is_premium = true;
      await user.save();
      console.log(`[Webhook] User ${appUserId} upgraded to premium.`);
    } else if (type === 'CANCELLATION' || type === 'EXPIRATION') {
      user.is_premium = false;
      await user.save();
      console.log(`[Webhook] User ${appUserId} lost premium access.`);
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('[Webhook] Error handling RevenueCat payload:', error);
    res.status(500).send('Internal Error');
  }
});

module.exports = router;
