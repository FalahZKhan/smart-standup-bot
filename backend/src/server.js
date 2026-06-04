// ============================================================
// Smart Daily Standup Bot - Express Server
// ============================================================
// This is the entry point for the backend.
// It sets up Express, connects middleware, and registers routes.

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import route files
const standupRoutes = require('./routes/standupRoutes');
const githubRoutes = require('./routes/githubRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// Middleware
// ============================================================

// CORS - Allows the React frontend (running on port 5173) to
// make requests to this backend (running on port 5000)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true
}));

// Parse incoming JSON request bodies
// Without this, req.body would be undefined
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Routes
// ============================================================

// Health check endpoint - useful to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Standup Bot API is running!',
    timestamp: new Date().toISOString()
  });
});

// Standup routes: /api/standups/*
app.use('/api/standups', standupRoutes);

// GitHub routes: /api/github/*
app.use('/api/github', githubRoutes);

// ============================================================
// 404 Handler - catches any unmatched routes
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// ============================================================
// Global Error Handler
// ============================================================
// This catches any errors that weren't handled in controllers
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred'
  });
});

// ============================================================
// Start the server
// ============================================================
app.listen(PORT, () => {
  console.log('');
  console.log(' Smart Daily Standup Bot Backend');
  console.log('====================================');
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log('');
});

module.exports = app;
