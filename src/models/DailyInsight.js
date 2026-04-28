const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const DailyInsight = sequelize.define('DailyInsight', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  energy_score: { type: DataTypes.INTEGER, defaultValue: 50 },
  logic_score: { type: DataTypes.INTEGER, defaultValue: 50 },
  career_score: { type: DataTypes.INTEGER, defaultValue: 50 },
  insight_text: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  peak_window_start: { type: DataTypes.TIME },
  peak_window_end: { type: DataTypes.TIME }
}, {
  timestamps: true,
  tableName: 'daily_insights',
  indexes: [
    { unique: true, fields: ['user_id', 'date'] } // A user can only have one insight per day
  ]
});

User.hasMany(DailyInsight, { foreignKey: 'user_id' });
DailyInsight.belongsTo(User, { foreignKey: 'user_id' });

module.exports = DailyInsight;