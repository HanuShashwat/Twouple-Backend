const express = require('express');
const router = express.Router();
const multer = require('multer');
const importController = require('../controllers/importController');
const { protect } = require('../middlewares/authMiddleware');

// Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Only accept .txt files
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are accepted. Export your WhatsApp chat as text.'), false);
    }
  }
});

router.use(protect);

// POST /api/v1/import/chat  — Upload a WhatsApp .txt export for AI analysis
router.post('/chat', upload.single('chatFile'), importController.uploadChat);

module.exports = router;
