/*
 * Monthly Leaderboard Reset Cron Job
 * Runs on the 1st of every month at 00:01 to reset the leaderboard.
 * Saves current rankings to history and awards badges to winners.
 */

const cron = require('node-cron');
const pool = require('../db/config');

// Schedule task to run at 00:01 on the 1st of every month
function startMonthlyReset() {
  cron.schedule('1 0 1 * *', async () => {
    console.log('Running monthly leaderboard reset...');
    
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
      
      // Award badge to #1 user
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
      
      console.log(`Monthly reset completed. Saved ${rankingsResult.rows.length} rankings to history.`);
    } catch (error) {
      console.error('Error in monthly reset:', error);
    }
  });
  
  console.log('Monthly reset cron job scheduled');
}

module.exports = { startMonthlyReset };