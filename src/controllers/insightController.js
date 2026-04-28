const Joi = require('joi');
const astrologyService = require('../services/astrologyService');

exports.getDailyData = async (req, res) => {
  // Validate that the date passed in the query is YYYY-MM-DD
  const schema = Joi.object({
    date: Joi.date().iso().required()
  });

  const { error, value } = schema.validate(req.query);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const dashboardData = await astrologyService.getDailyDashboard(req.user.id, value.date);
    return res.status(200).json({ success: true, data: dashboardData });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updatedTask = await astrologyService.toggleTaskCompletion(req.user.id, taskId);
    return res.status(200).json({ success: true, data: updatedTask });
  } catch (err) {
    return res.status(404).json({ success: false, message: err.message });
  }
};