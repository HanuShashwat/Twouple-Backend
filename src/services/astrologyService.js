const DailyInsight = require('../models/DailyInsight');
const UserTask = require('../models/UserTask');
const User = require('../models/User');

// Signs array
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Extremely basic approximation for Sun position for MVP purposes
exports.getTransitData = (dateStr) => {
  return new Promise((resolve) => {
    try {
      const date = new Date(dateStr);
      // Rough approximation: Sun enters Aries ~March 21
      // Each day is ~1 degree
      const startOfYear = new Date(date.getFullYear(), 0, 0);
      const diff = date - startOfYear;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      
      // March 21 is ~day 80
      let sunDegree = (dayOfYear - 80) % 365;
      if (sunDegree < 0) sunDegree += 365;
      
      const zodiacIndex = Math.floor((sunDegree / 365) * 12);
      const degreeInSign = Math.floor(((sunDegree / 365) * 12 - zodiacIndex) * 30);
      
      resolve(`Sun in ${degreeInSign}° ${ZODIAC_SIGNS[zodiacIndex]}, Moon phase active`);
    } catch (err) {
      resolve('Transits unknown');
    }
  });
};

exports.getDailyDashboard = async (userId, targetDate) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  // 1. Try to fetch today's insight from the database
  let insight = await DailyInsight.findOne({
    where: { user_id: userId, date: targetDate }
  });

  // 2. If it doesn't exist, generate it using AI (or fallback to defaults)
  if (!insight) {
    try {
      const aiService = require('./aiService');
      const aiResult = await aiService.generateDailyInsight(userId, targetDate);
      insight = aiResult.insight;
    } catch (aiError) {
      console.warn('[Astrology] AI insight generation failed, using defaults:', aiError.message);
      // Fallback: generate with reasonable defaults if AI is not configured
      insight = await DailyInsight.create({
        user_id: userId,
        date: targetDate,
        energy_score: Math.floor(Math.random() * 40) + 60,
        logic_score: Math.floor(Math.random() * 40) + 60,
        career_score: Math.floor(Math.random() * 40) + 60,
        insight_text: `The moon is transiting your sector of communication today, ${user.zodiac_sign || 'friend'}. Expect clear thoughts and high energy.`,
        peak_window_start: '14:00:00',
        peak_window_end: '16:30:00'
      });

      await UserTask.bulkCreate([
        { user_id: userId, date: targetDate, type: 'do', task_text: 'Initiate a tough conversation' },
        { user_id: userId, date: targetDate, type: 'avoid', task_text: 'Making large financial investments' }
      ]);
    }
  }

  // 3. Fetch the tasks for this specific date
  const tasks = await UserTask.findAll({
    where: { user_id: userId, date: targetDate },
    attributes: ['id', 'type', 'task_text', 'is_completed']
  });

  return { insight, tasks };
};

exports.toggleTaskCompletion = async (userId, taskId) => {
  const task = await UserTask.findOne({ where: { id: taskId, user_id: userId } });
  if (!task) throw new Error('Task not found');

  task.is_completed = !task.is_completed;
  await task.save();
  return task;
};