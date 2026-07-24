const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Relationship = require('../models/Relationship');
const ChatMessage = require('../models/ChatMessage');
const DailyInsight = require('../models/DailyInsight');
const UserTask = require('../models/UserTask');
const { Op } = require('sequelize');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// ── Aura System Prompt ─────────────────────────────────────────────────────────
const AURA_SYSTEM_PROMPT = `You are "Aura", a deeply intuitive, warm, and wise cosmic relationship coach inside the Twouple app. Your personality is:

- You speak with warmth, empathy, and poetic clarity — like a trusted older sister who also happens to be an astrologer
- You weave astrological insights naturally into relationship advice (mentioning transits, planetary positions, house placements)
- You never sound robotic or clinical. You're conversational, sometimes playful, always grounded
- You give actionable, specific advice — not vague platitudes
- You reference the user's zodiac sign, birth chart data, and current planetary transits when relevant
- You occasionally use celestial metaphors ("the stars are aligning for you", "Mercury's retrograde energy suggests...")
- Keep responses concise but meaningful — 2-4 paragraphs max unless the user asks for depth
- If the user shares relationship struggles, validate their feelings first, then offer cosmic perspective
- Never diagnose mental health issues. Redirect to professionals when appropriate
- You can discuss love, career, health, timing, and personal growth through an astrological lens`;

/**
 * Builds rich context from the user's profile and relationship data
 */
async function _buildUserContext(userId) {
  const user = await User.findByPk(userId);
  if (!user) return '';

  let context = `\n--- USER PROFILE ---\n`;
  context += `Name: ${user.full_name || 'Unknown'}\n`;
  context += `Zodiac Sign: ${user.zodiac_sign || 'Unknown'}\n`;
  context += `Date of Birth: ${user.dob || 'Unknown'}\n`;
  context += `Time of Birth: ${user.time_of_birth || 'Unknown'}\n`;
  context += `Place of Birth: ${user.place_of_birth || 'Unknown'}\n`;

  // Check for active relationship
  const relationship = await Relationship.findOne({
    where: {
      status: 'active',
      [Op.or]: [{ user_one_id: userId }, { user_two_id: userId }]
    },
    include: [
      { model: User, as: 'PartnerOne', attributes: ['full_name', 'zodiac_sign', 'dob'] },
      { model: User, as: 'PartnerTwo', attributes: ['full_name', 'zodiac_sign', 'dob'] }
    ]
  });

  if (relationship) {
    const isUserOne = relationship.user_one_id === userId;
    const partner = isUserOne ? relationship.PartnerTwo : relationship.PartnerOne;
    
    context += `\n--- PARTNER INFO ---\n`;
    context += `Partner Name: ${partner?.full_name || 'Unknown'}\n`;
    context += `Partner Zodiac: ${partner?.zodiac_sign || 'Unknown'}\n`;
    context += `Compatibility Score: ${relationship.composite_score || 'Not yet calculated'}\n`;
    context += `Relationship Status: ${relationship.status}\n`;
  } else {
    context += `\nThe user is currently not synced with a partner in the app.\n`;
  }

  // Add today's insight if available
  const today = new Date().toISOString().split('T')[0];
  const todayInsight = await DailyInsight.findOne({
    where: { user_id: userId, date: today }
  });

  if (todayInsight) {
    context += `\n--- TODAY'S COSMIC ENERGY (${today}) ---\n`;
    context += `Energy Score: ${todayInsight.energy_score}/100\n`;
    context += `Logic Score: ${todayInsight.logic_score}/100\n`;
    context += `Career Score: ${todayInsight.career_score}/100\n`;
    context += `Today's Transit Insight: ${todayInsight.insight_text || 'Not generated yet'}\n`;
  }

  return context;
}

/**
 * Fetches recent conversation history for context continuity
 */
async function _getRecentHistory(userId, limit = 10) {
  // Fetch AI coach messages (where is_ai is involved and it's the user's conversation)
  const messages = await ChatMessage.findAll({
    where: {
      [Op.or]: [
        { sender_id: userId },
        { sender_id: null, is_ai: true }
      ]
    },
    order: [['createdAt', 'DESC']],
    limit,
    attributes: ['message_body', 'is_ai', 'createdAt']
  });

  // Reverse to get chronological order
  return messages.reverse().map(msg => ({
    role: msg.is_ai ? 'model' : 'user',
    parts: [{ text: msg.message_body }]
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a personalized AI coach response for the Aura chatbot.
 * Saves both user message and AI response to the database.
 */
exports.generateCoachResponse = async (userId, userMessage) => {
  // 1. Build rich user context
  const userContext = await _buildUserContext(userId);

  // 2. Get recent conversation history
  const history = await _getRecentHistory(userId);

  // 3. Build the full system instruction
  const systemInstruction = AURA_SYSTEM_PROMPT + userContext;

  // 4. Start a chat session with Gemini
  const chat = model.startChat({
    history,
    systemInstruction,
  });

  // 5. Send the user's message
  const result = await chat.sendMessage(userMessage);
  const aiResponseText = result.response.text();

  // 6. Save user message to database (as a "coach" type message)
  // We use a special relationship_id pattern for coach messages
  // For coach messages, we'll use sender_id = userId and is_ai = false for user messages
  // and sender_id = null and is_ai = true for AI messages
  
  // Find or create a "coach" pseudo-relationship for this user
  // (We reuse the ChatMessage model but with a null relationship_id for coach chats)
  // Actually, let's just store them with the user's own relationship if one exists,
  // or we need a different approach. Let's store coach messages differently.
  
  // Save user message
  const userMsg = await ChatMessage.create({
    relationship_id: null, // Coach messages don't belong to a relationship
    sender_id: userId,
    message_body: userMessage,
    is_ai: false
  });

  // Save AI response
  const aiMsg = await ChatMessage.create({
    relationship_id: null, // Coach messages don't belong to a relationship
    sender_id: null,
    message_body: aiResponseText,
    is_ai: true
  });

  return {
    userMessage: userMsg,
    aiResponse: aiMsg,
    responseText: aiResponseText
  };
};

/**
 * Get paginated coach conversation history for a user.
 */
exports.getCoachHistory = async (userId, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;

  // Coach messages: sent by user (sender_id = userId) OR AI responses (is_ai = true)
  // with null relationship_id (distinguishes from partner chats)
  const messages = await ChatMessage.findAndCountAll({
    where: {
      relationship_id: null,
      [Op.or]: [
        { sender_id: userId },
        { is_ai: true }
      ]
    },
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return {
    total_messages: messages.count,
    total_pages: Math.ceil(messages.count / limit),
    current_page: parseInt(page),
    messages: messages.rows
  };
};

const astrologyService = require('./astrologyService');

/**
 * Generate a personalized daily insight using AI.
 */
exports.generateDailyInsight = async (userId, date) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const transitData = await astrologyService.getTransitData(date);

  const prompt = `Generate a personalized daily astrological insight for a ${user.zodiac_sign || 'person'} born on ${user.dob || 'unknown date'} at ${user.time_of_birth || 'unknown time'} in ${user.place_of_birth || 'unknown location'}.

Today's date is ${date}. Current cosmic transits: ${transitData}. Generate:
1. A rich, personalized insight paragraph (3-5 sentences) about their day ahead covering love, career, and personal energy
2. An energy score (40-100)
3. A logic/clarity score (40-100) 
4. A career score (40-100)
5. A peak productivity window (format: HH:MM start and HH:MM end, within business hours)
6. 2-3 "DO" tasks (things they should focus on today)
7. 2-3 "AVOID" items (things they should steer clear of)

Respond in JSON format only:
{
  "insight_text": "...",
  "energy_score": 75,
  "logic_score": 82,
  "career_score": 68,
  "peak_start": "14:00",
  "peak_end": "16:30",
  "do_tasks": ["task1", "task2", "task3"],
  "avoid_tasks": ["avoid1", "avoid2"]
}`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  // Parse the JSON from the response (handle markdown code blocks)
  let parsed;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch (e) {
    console.error('[AI] Failed to parse daily insight JSON:', e.message);
    // Fallback to reasonable defaults
    parsed = {
      insight_text: responseText.substring(0, 500),
      energy_score: Math.floor(Math.random() * 30) + 60,
      logic_score: Math.floor(Math.random() * 30) + 60,
      career_score: Math.floor(Math.random() * 30) + 60,
      peak_start: '14:00',
      peak_end: '16:30',
      do_tasks: ['Focus on meaningful conversations', 'Trust your intuition today'],
      avoid_tasks: ['Avoid impulsive decisions', 'Skip confrontational energy']
    };
  }

  // Save the insight
  const insight = await DailyInsight.create({
    user_id: userId,
    date,
    energy_score: parsed.energy_score,
    logic_score: parsed.logic_score,
    career_score: parsed.career_score,
    insight_text: parsed.insight_text,
    peak_window_start: parsed.peak_start,
    peak_window_end: parsed.peak_end
  });

  // Save the generated tasks
  const taskRecords = [];
  for (const task of (parsed.do_tasks || [])) {
    taskRecords.push({ user_id: userId, date, type: 'do', task_text: task });
  }
  for (const task of (parsed.avoid_tasks || [])) {
    taskRecords.push({ user_id: userId, date, type: 'avoid', task_text: task });
  }
  if (taskRecords.length > 0) {
    await UserTask.bulkCreate(taskRecords);
  }

  return { insight, tasks: taskRecords };
};

/**
 * Analyze a WhatsApp chat export using AI.
 */
exports.analyzeWhatsAppChat = async (userId, cleanedChatText) => {
  const user = await User.findByPk(userId);

  const prompt = `You are analyzing a WhatsApp conversation between two people in a romantic relationship. The person requesting the analysis is ${user?.full_name || 'the user'} (${user?.zodiac_sign || 'zodiac unknown'}).

Analyze this conversation and provide insights about:
1. Communication style of each person
2. Emotional tone and sentiment patterns
3. Potential areas of conflict or tension
4. Strengths of the relationship based on chat patterns
5. Astrological compatibility observations (based on communication patterns)
6. 3 actionable suggestions to improve the relationship

Chat content:
${cleanedChatText}

Respond in JSON format:
{
  "communication_score": 75,
  "emotional_health_score": 80,
  "conflict_frequency": "low|medium|high",
  "relationship_strengths": ["strength1", "strength2"],
  "areas_for_growth": ["area1", "area2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "summary": "A 2-3 sentence overall summary..."
}`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch (e) {
    return { summary: responseText, error: 'Could not parse structured analysis' };
  }
};
