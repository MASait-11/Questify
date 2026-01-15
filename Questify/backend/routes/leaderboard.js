/*
 * Leaderboard Routes
 * Handles current month leaderboard and historical leaderboard data.
 * Includes monthly reset functionality (called by cron job).
 */

const express = require('express');
const pool = require('../db/config');
const router = express.Router();

// Get current month's leaderboard
router.get('/current', async (req, res) => {
  const { user_id } = req.query;
  
  try {
    // Get top 10 users by monthly points
    const leaderboardResult = await pool.query(
      `SELECT 
        ml.user_id,
        ml.points::INTEGER as points,
        u.username,
        u.current_streak,
        ROW_NUMBER() OVER (ORDER BY ml.points DESC)::INTEGER as rank
       FROM monthly_leaderboard ml
       JOIN users u ON ml.user_id = u.id
       WHERE ml.points > 0
       ORDER BY ml.points DESC
       LIMIT 10`
    );
    
    let userRank = null;
    
    // If user_id provided, get their specific rank
    if (user_id) {
      // Get user's points first
      const userPointsResult = await pool.query(
        'SELECT points FROM monthly_leaderboard WHERE user_id = $1',
        [user_id]
      );
      
      if (userPointsResult.rows.length > 0) {
        const userPoints = userPointsResult.rows[0].points || 0;
        
        // Count users with more points
        const rankResult = await pool.query(
          'SELECT COUNT(*) + 1 as rank FROM monthly_leaderboard WHERE points > $1',
          [userPoints]
        );
        
        userRank = {
          rank: parseInt(rankResult.rows[0].rank),
          points: userPoints
        };
      } else {
        // User not in leaderboard yet, add them with 0 points
        await pool.query(
          'INSERT INTO monthly_leaderboard (user_id, points) VALUES ($1, 0) ON CONFLICT (user_id) DO NOTHING',
          [user_id]
        );
        userRank = {
          rank: 0,
          points: 0
        };
      }
    }
    
    res.json({
      leaderboard: leaderboardResult.rows,
      user_rank: userRank
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
});

// Get leaderboard history for a specific user
router.get('/history/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT 
        month,
        year,
        final_points,
        rank,
        created_at
       FROM leaderboard_history
       WHERE user_id = $1
       ORDER BY year DESC, month DESC
       LIMIT 12`,
      [userId]
    );
    
    res.json({ history: result.rows });
  } catch (error) {
    console.error('Error fetching leaderboard history:', error);
    res.status(500).json({ error: 'Server error fetching history' });
  }
});

// Get all-time leaderboard (based on total_points)
router.get('/all-time', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        username,
        total_points,
        current_streak,
        longest_streak,
        ROW_NUMBER() OVER (ORDER BY total_points DESC) as rank
       FROM users
       ORDER BY total_points DESC
       LIMIT 10`
    );
    
    res.json({ leaderboard: result.rows });
  } catch (error) {
    console.error('Error fetching all-time leaderboard:', error);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
});

// Reset monthly leaderboard (called by cron job on 1st of month)
router.post('/reset', async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() === 0 ? 12 : now.getMonth(); // Previous month
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    
    // Get current rankings
    const rankingsResult = await pool.query(
      `SELECT 
        user_id,
        points,
        ROW_NUMBER() OVER (ORDER BY points DESC) as rank
       FROM monthly_leaderboard
       WHERE points > 0
       ORDER BY points DESC`
    );
    
    // Save to history
    for (const row of rankingsResult.rows) {
      await pool.query(
        'INSERT INTO leaderboard_history (user_id, month, year, final_points, rank) VALUES ($1, $2, $3, $4, $5)',
        [row.user_id, month, year, row.points, row.rank]
      );
    }
    
    // Award "Leaderboard King/Queen" badge to #1 user
    if (rankingsResult.rows.length > 0) {
      const winnerId = rankingsResult.rows[0].user_id;
      
      // Check if badge already exists
      const badgeCheck = await pool.query(
        'SELECT * FROM badges WHERE user_id = $1 AND badge_type = $2',
        [winnerId, 'Leaderboard King/Queen']
      );
      
      if (badgeCheck.rows.length === 0) {
        await pool.query(
          'INSERT INTO badges (user_id, badge_type) VALUES ($1, $2)',
          [winnerId, 'Leaderboard King/Queen']
        );
      }
    }
    
    // Reset all points to 0
    await pool.query('UPDATE monthly_leaderboard SET points = 0, last_updated = CURRENT_TIMESTAMP');
    
    console.log('Monthly leaderboard reset completed');
    
    res.json({
      message: 'Leaderboard reset successfully',
      saved_rankings: rankingsResult.rows.length
    });
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    res.status(500).json({ error: 'Server error resetting leaderboard' });
  }
});

module.exports = router;