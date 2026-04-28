const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    // Only show SQL logs in development mode, keep production terminal clean
    logging: process.env.NODE_ENV === 'development' ? console.log : false, 
    pool: {
      max: 10, // Increased to 10 to handle simultaneous AI and Astro API database writes
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+05:30', // Enforce Indian Standard Time natively in the database
  }
);

module.exports = sequelize;