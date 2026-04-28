const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User'); 

const Relationship = sequelize.define('Relationship', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_one_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  user_two_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'disconnected'),
    defaultValue: 'pending',
  },
  composite_score: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  established_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: 'relationships'
});

// Notice how the associations are GONE from here! 
// They are safely living in src/models/index.js now.

module.exports = Relationship;