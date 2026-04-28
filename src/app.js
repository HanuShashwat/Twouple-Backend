const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import the main router hub and error middlewares
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const app = express();

// Global Middlewares
app.use(helmet()); 
app.use(cors()); 
app.use(morgan('dev')); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Simple Health Check Route (Great for AWS/Load Balancer pings)
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Twouple API is up and running!' });
});

// Mount all API routes under /api/v1
app.use('/api/v1', routes);

// Safety Nets: If a request makes it past the routes, it hits these.
app.use(notFound); // Catches 404s
app.use(errorHandler); // Catches all thrown errors and formats them

module.exports = app;