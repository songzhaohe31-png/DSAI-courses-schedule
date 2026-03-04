/**
 * HKMU Course Selection Guidance System - Main Server
 * 
 * This is the main entry point for the backend API server.
 * It sets up Express, configures middleware, mounts routes,
 * and handles database initialization.
 * 
 * @module server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database and routes
const { initializeDatabase } = require('./database');
const coursesRouter = require('./routes/courses');
const reviewsRouter = require('./routes/reviews');
const materialsRouter = require('./routes/materials');
const progressRouter = require('./routes/progress');

// Create Express application
const app = express();
const PORT = process.env.PORT || 3001;

// ==================== MIDDLEWARE CONFIGURATION ====================

/**
 * CORS Configuration
 * Allows requests from frontend development server
 */
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

/**
 * Body Parsing Middleware
 * Parses JSON and URL-encoded request bodies
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Static File Serving
 * Serves uploaded files from the uploads directory
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Request Logging Middleware
 * Logs all incoming requests for debugging
 */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ==================== API ROUTES ====================

/**
 * Health Check Endpoint
 * Returns server status and timestamp
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HKMU Course Selection API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * Mount Route Handlers
 */
app.use('/api/courses', coursesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/progress', progressRouter);

// ==================== ERROR HANDLING ====================

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes
 */
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    path: req.path,
    method: req.method
  });
});

/**
 * Global Error Handler
 * Catches all errors and returns appropriate response
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File Too Large',
      message: 'The uploaded file exceeds the maximum allowed size of 50MB'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Invalid File',
      message: 'Unexpected file field or file type not allowed'
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==================== SERVER STARTUP ====================

/**
 * Start Server
 * Initializes database and starts listening on configured port
 */
async function startServer() {
  try {
    // Initialize database (create tables and seed data)
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Start server
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('HKMU Course Selection Guidance System API');
      console.log('='.repeat(60));
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API Documentation:`);
      console.log(`  - Health Check: GET http://localhost:${PORT}/api/health`);
      console.log(`  - Courses:      GET http://localhost:${PORT}/api/courses`);
      console.log(`  - Reviews:      GET http://localhost:${PORT}/api/reviews/:courseId`);
      console.log(`  - Materials:    GET http://localhost:${PORT}/api/materials/:courseId`);
      console.log(`  - Progress:     GET http://localhost:${PORT}/api/progress/:userId`);
      console.log('='.repeat(60));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
