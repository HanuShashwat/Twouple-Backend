require('dotenv').config();
const app = require('./app');
// Import the central hub, not just the db connection!
const { sequelize } = require('./models'); 

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Authenticate connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // 2. AUTO-CREATE TABLES
    // { alter: true } safely updates tables to match your models. 
    // In strict production, you would remove this and use migration files.
    const isDev = process.env.NODE_ENV !== 'production';
    await sequelize.sync({ alter: isDev }); 
    console.log('✅ Database models synchronized and tables auto-created.');

    // 3. Start the Express App
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Twouple Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start the server:', error);
    process.exit(1);
  }
};

startServer();