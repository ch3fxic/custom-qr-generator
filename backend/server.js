require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const { initializeDatabase } = require('./models/database');
const corsMiddleware = require('./middleware/cors');
const rateLimitMiddleware = require('./middleware/rateLimit');
const qrRoutes = require('./routes/qr');
const redirectRoutes = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS middleware
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
app.use(rateLimitMiddleware);

// Initialize database
initializeDatabase()
  .then(() => {
    console.log('✅ Database initialized successfully');
  })
  .catch((err) => {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', qrRoutes);

// Redirect routes (for shortened URLs)
app.use('/r', redirectRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}`);
});

module.exports = app;
