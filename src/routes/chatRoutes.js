const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/send', chatController.send);
router.get('/history', chatController.getHistory);

// THIS IS THE LINE THAT FIXES YOUR ERROR 👇
module.exports = router;