/*
 * Badge Service
 * Checks user achievements and awards badges based on various criteria.
 * Called after significant user actions (completing tasks, adding friends, etc.)
 * Returns list of newly unlocked badges.
 */

const pool = require('../db/config');

/**
 * Check if user has earned any new badges
 * @param {number} userId - User ID to check badges for
 * @returns {Promise<Array>} Array of newly unlocked badge types
 */
async function checkBadges(userId) {
  const newBadges = [];
  
  try {
    // Get user's current stats
    const userResult = await pool.query(
      'SELECT current_streak, longest_streak FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return newBadges;
    }
    
    const user = userResult.rows[0];
    
    // Count completed tasks
    const taskCountResult = await pool.query(
      'SELECT COUNT(*) FROM task_completions WHERE user_id = $1',
      [userId]
    );
    const taskCount = parseInt(taskCountResult.rows[0].count);
    
    // Count unique completed goals
    const goalCountResult = await pool.query(
      'SELECT COUNT(DISTINCT goal_id) FROM task_completions WHERE user_id = $1',
      [userId]
    );
    const goalCount = parseInt(goalCountResult.rows[0].count);
    
    // Count friends
    const friendCountResult = await pool.query(
      'SELECT COUNT(*) FROM friendships WHERE user_id = $1',
      [userId]
    );
    const friendCount = parseInt(friendCountResult.rows[0].count);
    
    // Count nudges sent
    const nudgeCountResult = await pool.query(
      'SELECT COUNT(*) FROM nudges WHERE from_user_id = $1',
      [userId]
    );
    const nudgeCount = parseInt(nudgeCountResult.rows[0].count);
    
    // Get already earned badges
    const existingBadgesResult = await pool.query(
      'SELECT badge_type FROM badges WHERE user_id = $1',
      [userId]
    );
    const existingBadgeTypes = existingBadgesResult.rows.map(b => b.badge_type);
    
    // Helper function to check if user has badge
    const hasBadge = (type) => existingBadgeTypes.includes(type);
    
    // Check for "First Steps" badge - complete first task
    if (taskCount >= 1 && !hasBadge('First Steps')) {
      await pool.query(
        'INSERT INTO badges (user_id, badge_type) VALUES ($1, $2)',
        [userId, 'First Steps']
      );
      newBadges.push('First Steps');
    }
    
    // Check for "Week Warrior" badge - 7 day streak
    if (user.current_streak >= 7 && !hasBadge('Week Warrior')) {
      await pool.query(
        'INSERT INTO badges (user_id, badge_type) VALUES ($1, $2)',
        [userId, 'Week Warrior']
      );
      newBadges.push('Week Warrior');
    }
    
    // Check for "Monthly Master" badge - 30 day streak
    if (user.current_streak >= 30 && !hasBadge('Monthly Master')) {
      await pool.query(
        'INSERT INTO badges (user_id, badge_type) VALUES ($1, $2)',
        [userId, 'Monthly Master']
      );
      newBadges.push('Monthly Master');
    }
    
    // Check for "Goal Crusher" badge - complete 5 different goals
    if (goalCount >= 5 && !hasBadge('Goal Crusher')) {
      await pool.query(
        'INSERT INTO badges (user_id, badge_type) VALUES ($1, $2)',
        [userId, 'Goal Crusher']
      );
      newBadges.push('Goal Crusher');
    }
    
    // Check for "Social Butterfly" badge - connect with 10 friends
    if (friendCount >= 10 && !hasBadge('Social Butterfly')) {
      await pool.query(
        'INSERT INTO badges (user_id, badge_type) VALUES ($1, $2)',
        [userId, 'Social Butterfly']
      );
      newBadges.push('Social Butterfly');
    }
    
    // Check for "Helping Hand" badge - send 20 nudges
    if (nudgeCount >= 20 && !hasBadge('Helping Hand')) {
      await pool.query(
        'INSERT INTO badges (user_id, badge_type) VALUES ($1, $2)',
        [userId, 'Helping Hand']
      );
      newBadges.push('Helping Hand');
    }
    
    // Check for "Comeback Kid" badge - rebuild streak after losing one
    // Only award if user had a streak before and current streak is at least 3
    if (user.longest_streak > user.current_streak && 
        user.current_streak >= 3 && 
        !hasBadge('Comeback Kid')) {
      await pool.query(
        'INSERT INTO badges (user_id, badge_type) VALUES ($1, $2)',
        [userId, 'Comeback Kid']
      );
      newBadges.push('Comeback Kid');
    }
    
    return newBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return newBadges;
  }
}

/**
 * Get all badges for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of badge objects with type and unlock date
 */
async function getUserBadges(userId) {
  try {
    const result = await pool.query(
      'SELECT badge_type, unlocked_at FROM badges WHERE user_id = $1 ORDER BY unlocked_at DESC',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}

module.exports = { checkBadges, getUserBadges };