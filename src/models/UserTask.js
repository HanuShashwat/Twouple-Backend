const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const UserTask = sequelize.define('UserTask', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: 'id' }
  },
  type: {
    type: DataTypes.ENUM('do', 'avoid'),
    allowNull: false,
  },
  task_text: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  }
}, {
  timestamps: true,
  tableName: 'user_tasks'
});

module.exports = UserTask;