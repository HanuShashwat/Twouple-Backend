const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    }
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  time_of_birth: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  place_of_birth: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  zodiac_sign: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  is_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  timestamps: true,
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['phone_number'] // Optimizes the findOrCreate login query
    }
  ]
});

module.exports = User;