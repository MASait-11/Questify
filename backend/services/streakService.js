/*
 * Streak Service
 * Handles all streak-related logic including calculating and updating user streaks.
 * A streak is maintained by completing at least one task every day.
 * Streaks reset if a user misses a full day without completing any tasks.
 */

const pool = require('../db/config');

/**
 * Update user's streak based on their last activity
 * Called whenever a user completes a task
 * @param {number} userId - User ID to update streak for
 * @returns {Promise<number>} New streak count
 */
async function updateStreak(userId) {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch user's current streak data
    const userResult = await pool.query(
      'SELECT current_streak, longest_streak, last_activity_date FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = userResult.rows[0];
    const lastActivity = user.last_activity_date;
    const currentStreak = user.current_streak || 0;
    const longestStreak = user.longest_streak || 0;
    
    // If this is the first activity ever
    if (!lastActivity) {
      await pool.query(
        'UPDATE users SET current_streak = 1, longest_streak = 1, last_activity_date = $1 WHERE id = $2',
        [today, userId]
      );
      return 1;
    }
    
    // Calculate yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if last activity was yesterday (continuing streak)
    if (lastActivity === yesterdayStr) {
      const newStreak = currentStreak + 1;
      const newLongestStreak = Math.max(newStreak, longestStreak);
      
      await pool.query(
        'UPDATE users SET current_streak = $1, longest_streak = $2, last_activity_date = $3 WHERE id = $4',
        [newStreak, newLongestStreak, today, userId]
      );
      
      return newStreak;
    } 
    // Check if last activity was today (already logged today)
    else if (lastActivity === today) {
      // Streak already counted for today, just return current streak
      return currentStreak;
    } 
    // Last activity was more than 1 day ago (streak broken)
    else {
      // Reset streak to 1 (starting fresh with today's activity)
      await pool.query(
        'UPDATE users SET current_streak = 1, last_activity_date = $1 WHERE id = $2',
        [today, userId]
      );
      
      return 1;
    }
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
}

/**
 * Check and update streaks for all users (called by cron job)
 * Resets streaks for users who haven't completed tasks today
 */
async function checkAllStreaks() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Find users whose last activity was NOT yesterday or today
    // These users have broken their streak
    await pool.query(
      `UPDATE users 
       SET current_streak = 0 
       WHERE last_activity_date < $1 
       AND last_activity_date IS NOT NULL 
       AND current_streak > 0`,
      [yesterdayStr]
    );
    
    console.log('Daily streak check completed');
  } catch (error) {
    console.error('Error in daily streak check:', error);
  }
}

module.exports = { updateStreak, checkAllStreaks };