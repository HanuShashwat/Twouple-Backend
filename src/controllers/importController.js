const { cleanWhatsAppChat } = require('../utils/whatsappParser');
const aiService = require('../services/aiService');

exports.uploadChat = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please upload a .txt WhatsApp chat export.' });
    }

    // Read the uploaded file content
    const rawText = req.file.buffer.toString('utf-8');

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'The uploaded file appears to be empty or too short for analysis.' });
    }

    // Clean the chat using the existing parser
    const cleanedText = cleanWhatsAppChat(rawText);

    if (!cleanedText || cleanedText.trim().length < 30) {
      return res.status(400).json({ success: false, message: 'Could not extract meaningful chat content from the file.' });
    }

    // Analyze with AI
    const analysis = await aiService.analyzeWhatsAppChat(req.user.id, cleanedText);

    return res.status(200).json({
      success: true,
      data: {
        analysis,
        message_count: cleanedText.split('\n').length,
        analyzed_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[Import] Chat analysis error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to analyze chat: ' + err.message });
  }
};
