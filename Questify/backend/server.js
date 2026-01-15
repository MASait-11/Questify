/*
 * Main Express Server
 * This is the entry point for the backend API.
 * Sets up middleware, routes, and starts the server.
 * Also initializes cron jobs for daily and monthly tasks.
 */

const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const goalRoutes = require('./routes/goals');
const socialRoutes = require('./routes/social');
const leaderboardRoutes = require('./routes/leaderboard');
const gamificationRoutes = require('./routes/gamification');

// Import cron jobs
const { startDailyStreakCheck } = require('./cron/dailyStreakCheck');
const { startMonthlyReset } = require('./cron/monthlyReset');

const app = express();

// Middleware setup
app.use(cors({
  origin: 'http://localhost:3001', // React dev server
  credentials: true // Allow cookies/sessions
}));

app.use(express.json()); // Parse JSON request bodies

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true, // Prevent XSS attacks
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/gamification', gamificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start cron jobs
startDailyStreakCheck();
startMonthlyReset();

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});