const sequelize = require('../config/db');

// 1. Import all individual models
const User = require('./User');
const Relationship = require('./Relationship');
const DailyInsight = require('./DailyInsight');
const UserTask = require('./UserTask');
const ChatMessage = require('./ChatMessage'); // Assuming you created this from the HLD

// 2. Define all Database Relationships (Foreign Keys) here centrally
// --- User <-> Relationship ---
User.hasMany(Relationship, { foreignKey: 'user_one_id', as: 'InitiatedRelationships' });
User.hasMany(Relationship, { foreignKey: 'user_two_id', as: 'ReceivedRelationships' });
Relationship.belongsTo(User, { foreignKey: 'user_one_id', as: 'PartnerOne' });
Relationship.belongsTo(User, { foreignKey: 'user_two_id', as: 'PartnerTwo' });

// --- User <-> DailyInsight ---
User.hasMany(DailyInsight, { foreignKey: 'user_id' });
DailyInsight.belongsTo(User, { foreignKey: 'user_id' });

// --- User <-> UserTask ---
User.hasMany(UserTask, { foreignKey: 'user_id' });
UserTask.belongsTo(User, { foreignKey: 'user_id' });

// Inside src/models/index.js, add these lines:
Relationship.hasMany(ChatMessage, { foreignKey: 'relationship_id', as: 'Messages' });
ChatMessage.belongsTo(Relationship, { foreignKey: 'relationship_id' });

User.hasMany(ChatMessage, { foreignKey: 'sender_id' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });

// 3. Export the connected database object
module.exports = {
  sequelize,
  User,
  Relationship,
  DailyInsight,
  UserTask,
  ChatMessage
};