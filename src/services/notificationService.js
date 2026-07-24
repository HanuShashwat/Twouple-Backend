const admin = require('firebase-admin');

// Note: In production, set FIREBASE_SERVICE_ACCOUNT base64 string in env vars
// or use GOOGLE_APPLICATION_CREDENTIALS
let isInitialized = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('ascii'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isInitialized = true;
    console.log('✅ Firebase Admin SDK initialized');
  } else {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not provided. Push notifications are disabled.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
}

exports.sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!isInitialized || !fcmToken) return false;

  const payload = {
    notification: {
      title,
      body,
    },
    data,
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(payload);
    console.log(`[FCM] Successfully sent message: ${response}`);
    return true;
  } catch (error) {
    console.error(`[FCM] Error sending message:`, error.message);
    return false;
  }
};
