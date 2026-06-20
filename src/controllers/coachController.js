const Joi = require('joi');
const aiService = require('../services/aiService');

/**
 * POST /coach/send
 * Send a message to the Aura AI coach and get a response.
 */
exports.send = async (req, res) => {
  const schema = Joi.object({
    message: Joi.string().min(1).max(2000).required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const result = await aiService.generateCoachResponse(req.user.id, value.message);
    
    return res.status(200).json({
      success: true,
      data: {
        message: result.aiResponse,
        responseText: result.responseText
      }
    });
  } catch (err) {
    console.error('[Coach Send Error]:', err.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate AI response. Please try again.' 
    });
  }
};

/**
 * GET /coach/history
 * Get paginated coach conversation history.
 */
exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const history = await aiService.getCoachHistory(req.user.id, page, limit);
    return res.status(200).json({ success: true, data: history });
  } catch (err) {
    console.error('[Coach History Error]:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve chat history.' });
  }
};
