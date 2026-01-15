/*
 * Gamification Routes
 * Handles streaks, badges, and other gamification features.
 * Provides endpoints to fetch user achievements and statistics.
 */

const express = require('express');
const pool = require('../db/config');
const { getUserBadges } = require('../services/badgeService');
const { generateMessage } = require('../services/gemini');
const router = express.Router();

// Get user's streak information
router.get('/streak/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT current_streak, longest_streak, last_activity_date FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ streak_data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching streak:', error);
    res.status(500).json({ error: 'Server error fetching streak' });
  }
});

// Get all badges for a user
router.get('/badges/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const badges = await getUserBadges(userId);
    res.json({ badges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Server error fetching badges' });
  }
});

// Get user statistics (for profile page)
router.get('/stats/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get user basic info
    const userResult = await pool.query(
      'SELECT username, total_points, current_streak, longest_streak, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Count total tasks completed
    const tasksResult = await pool.query(
      'SELECT COUNT(*) as total_tasks FROM task_completions WHERE user_id = $1',
      [userId]
    );
    
    // Count total goals created
    const goalsResult = await pool.query(
      'SELECT COUNT(*) as total_goals FROM goals WHERE user_id = $1',
      [userId]
    );
    
    // Count completed goals (goals with at least one task completion)
    const completedGoalsResult = await pool.query(
      'SELECT COUNT(DISTINCT goal_id) as completed_goals FROM task_completions WHERE user_id = $1',
      [userId]
    );
    
    // Count friends
    const friendsResult = await pool.query(
      'SELECT COUNT(*) as friend_count FROM friendships WHERE user_id = $1',
      [userId]
    );
    
    // Count badges
    const badgesResult = await pool.query(
      'SELECT COUNT(*) as badge_count FROM badges WHERE user_id = $1',
      [userId]
    );
    
    // Get monthly leaderboard rank
    const rankResult = await pool.query(
      `SELECT COUNT(*) + 1 as rank
       FROM monthly_leaderboard
       WHERE points > (SELECT points FROM monthly_leaderboard WHERE user_id = $1)`,
      [userId]
    );
    
    res.json({
      user: userResult.rows[0],
      stats: {
        total_tasks: parseInt(tasksResult.rows[0].total_tasks),
        total_goals: parseInt(goalsResult.rows[0].total_goals),
        completed_goals: parseInt(completedGoalsResult.rows[0].completed_goals),
        friend_count: parseInt(friendsResult.rows[0].friend_count),
        badge_count: parseInt(badgesResult.rows[0].badge_count),
        current_rank: rankResult.rows.length > 0 ? parseInt(rankResult.rows[0].rank) : null
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

// Get motivational quote for dashboard
router.get('/quote', async (req, res) => {
  try {
    console.log('[Quote Endpoint] Requesting quote from Gemini...');
    const quote = await generateMessage('dashboard_quote', {});
    console.log('[Quote Endpoint] Got quote:', quote);
    res.json({ quote });
  } catch (error) {
    console.error('Error generating quote:', error);
    // Return a random fallback quote instead of the same one
    const fallbackQuotes = [
      'Success is the sum of small efforts repeated day in and day out. 🌟',
      'The only way to do great work is to love what you do. 💪',
      'Every accomplishment starts with the decision to try. 🚀',
      'Don\'t watch the clock; do what it does. Keep going. ⏰',
      'The future depends on what you do today. 🎯',
      'Believe you can and you\'re halfway there. 🌱',
      'Excellence is not a destination; it\'s a continuous journey. 🎯',
      'Your limitations—only your imagination. 🌈'
    ];
    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    res.json({ quote: randomQuote });
  }
});

module.exports = router;