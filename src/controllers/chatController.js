const Joi = require('joi');
const chatService = require('../services/chatService');

exports.send = async (req, res) => {
  const schema = Joi.object({
    message_body: Joi.string().min(1).max(2000).required() // Max 2000 chars per message
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const message = await chatService.sendMessage(req.user.id, value.message_body);
    return res.status(201).json({ success: true, data: message });
  } catch (err) {
    return res.status(403).json({ success: false, message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    // Extract page and limit from the query string (e.g., ?page=1&limit=50)
    const { page = 1, limit = 50 } = req.query;
    
    const history = await chatService.getChatHistory(req.user.id, page, limit);
    return res.status(200).json({ success: true, data: history });
  } catch (err) {
    return res.status(404).json({ success: false, message: err.message });
  }
};