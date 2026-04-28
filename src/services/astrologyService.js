const DailyInsight = require('../models/DailyInsight');
const UserTask = require('../models/UserTask');
const User = require('../models/User');

exports.getDailyDashboard = async (userId, targetDate) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  // 1. Try to fetch today's insight from the database
  let insight = await DailyInsight.findOne({
    where: { user_id: userId, date: targetDate }
  });

  // 2. If it doesn't exist, calculate and generate it on the fly
  if (!insight) {
    // [TODO]: Connect to external Ephemeris API here using user.place_of_birth and user.time_of_birth
    // For now, we simulate the astrological math with dynamic defaults
    insight = await DailyInsight.create({
      user_id: userId,
      date: targetDate,
      energy_score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      logic_score: Math.floor(Math.random() * 40) + 60,
      career_score: Math.floor(Math.random() * 40) + 60,
      insight_text: `The moon is transiting your sector of communication today, ${user.zodiac_sign || 'friend'}. Expect clear thoughts and high energy.`,
      peak_window_start: '14:00:00',
      peak_window_end: '16:30:00'
    });

    // Auto-generate some default DO and AVOID tasks for the day based on the transits
    await UserTask.bulkCreate([
      { user_id: userId, date: targetDate, type: 'do', task_text: 'Initiate a tough conversation' },
      { user_id: userId, date: targetDate, type: 'avoid', task_text: 'Making large financial investments' }
    ]);
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