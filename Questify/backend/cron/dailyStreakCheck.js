/*
 * Daily Streak Check Cron Job
 * Runs daily at midnight to reset streaks for users who missed a day.
 * Checks if user completed any tasks since last activity date.
 */

const cron = require('node-cron');
const pool = require('../db/config');
const { updateStreak } = require('../services/streakService');

// Run daily at 00:00 UTC
function startDailyStreakCheck() {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily streak check...');
    
    try {
      // Get all users
      const usersResult = await pool.query('SELECT id FROM users');
      const users = usersResult.rows;
      
      // Check each user's streak
      for (const user of users) {
        await updateStreak(user.id);
      }
      
      console.log('Daily streak check completed');
    } catch (error) {
      console.error('Error in daily streak check:', error);
    }
  });
  
  console.log('Daily streak check cron job scheduled');
}

module.exports = { startDailyStreakCheck };
