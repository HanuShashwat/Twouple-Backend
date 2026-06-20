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

exports.addTask = async (req, res) => {
  const schema = Joi.object({
    type: Joi.string().valid('do', 'avoid').required(),
    task_text: Joi.string().min(1).max(255).required(),
    date: Joi.date().iso().required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const UserTask = require('../models/UserTask');
    const newTask = await UserTask.create({
      user_id: req.user.id,
      type: value.type,
      task_text: value.task_text,
      date: value.date,
      is_completed: false
    });
    return res.status(201).json({ success: true, data: newTask });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};