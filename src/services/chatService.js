const ChatMessage = require('../models/ChatMessage');
const Relationship = require('../models/Relationship');
const User = require('../models/User');

exports.sendMessage = async (userId, messageBody) => {
  // 1. Find the user's active relationship
  const relationship = await Relationship.findOne({
    where: {
      status: 'active',
      // Check if user is either partner 1 or 2
      $or: [{ user_one_id: userId }, { user_two_id: userId }] 
    }
  });

  if (!relationship) throw new Error('You must be in an active relationship to send messages.');

  // 2. Save the message to the database
  const message = await ChatMessage.create({
    relationship_id: relationship.id,
    sender_id: userId,
    message_body: messageBody,
    is_ai: false
  });

  return message;
};

exports.getChatHistory = async (userId, page = 1, limit = 50) => {
  // Find active relationship
  const relationship = await Relationship.findOne({
    where: { status: 'active', $or: [{ user_one_id: userId }, { user_two_id: userId }] }
  });

  if (!relationship) throw new Error('No active relationship found.');

  const offset = (page - 1) * limit;

  // Fetch paginated messages, newest first
  const messages = await ChatMessage.findAndCountAll({
    where: { relationship_id: relationship.id },
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
    include: [{
      model: User,
      as: 'Sender',
      attributes: ['id', 'full_name'] // Only fetch what we need
    }]
  });

  return {
    total_messages: messages.count,
    total_pages: Math.ceil(messages.count / limit),
    current_page: parseInt(page),
    messages: messages.rows
  };
};