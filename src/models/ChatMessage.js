const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Relationship = require('./Relationship');

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  relationship_id: {
    type: DataTypes.UUID,
    allowNull: true, // Nullable: null for AI coach messages, set for partner chat messages
    references: { model: Relationship, key: 'id' }
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: true, // It can be null if the AI (Aura) sends the message!
    references: { model: User, key: 'id' }
  },
  message_body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_ai: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  timestamps: true,
  updatedAt: false, // We only care about when a message was created, not updated. Saves DB space.
  tableName: 'chat_messages',
  indexes: [
    // This composite index makes fetching a couple's chat history insanely fast
    { fields: ['relationship_id', 'createdAt'] } 
  ]
});

module.exports = ChatMessage;