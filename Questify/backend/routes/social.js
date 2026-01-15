/*
 * Social Routes
 * Handles friend connections, friend feed, and nudge system.
 * Friends can see each other's progress and send encouraging nudges.
 */

const express = require('express');
const pool = require('../db/config');
const { generateMessage } = require('../services/gemini');
const { checkBadges } = require('../services/badgeService');
const router = express.Router();

// Add a friend by username
router.post('/add-friend', async (req, res) => {
  const { user_id, friend_username } = req.body;
  
  try {
    // Validate input
    if (!user_id || !friend_username) {
      return res.status(400).json({ error: 'User ID and friend username are required' });
    }
    
    // Find friend by username
    const friendResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [friend_username]
    );
    
    if (friendResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const friendId = friendResult.rows[0].id;
    
    // Can't add yourself as friend
    if (user_id === friendId) {
      return res.status(400).json({ error: 'Cannot add yourself as a friend' });
    }
    
    // Check if friendship already exists
    const existingFriendship = await pool.query(
      'SELECT * FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [user_id, friendId]
    );
    
    if (existingFriendship.rows.length > 0) {
      return res.status(400).json({ error: 'Already friends with this user' });
    }
    
    // Add friendship (bidirectional - add both directions)
    await pool.query(
      'INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2)',
      [user_id, friendId]
    );
    
    await pool.query(
      'INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2)',
      [friendId, user_id]
    );
    
    // Check if user unlocked any badges (like Social Butterfly)
    await checkBadges(user_id);
    
    res.status(201).json({
      message: 'Friend added successfully',
      friend_id: friendId
    });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Server error adding friend' });
  }
});

// Get list of friends for a user
router.get('/friends/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get all friends with their user info
    const result = await pool.query(
      `SELECT u.id, u.username, u.total_points, u.current_streak, u.longest_streak
       FROM friendships f
       JOIN users u ON f.friend_id = u.id
       WHERE f.user_id = $1
       ORDER BY u.username`,
      [userId]
    );
    
    res.json({ friends: result.rows });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Server error fetching friends' });
  }
});

// Get friend activity feed (recent task completions)
router.get('/feed/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get recent task completions from friends
    const result = await pool.query(
      `SELECT 
        tc.id,
        tc.completed_date,
        tc.points_earned,
        tc.created_at,
        u.id as friend_id,
        u.username as friend_username,
        g.id as goal_id,
        g.title as goal_title,
        g.category,
        g.frequency
       FROM task_completions tc
       JOIN users u ON tc.user_id = u.id
       JOIN goals g ON tc.goal_id = g.id
       WHERE tc.user_id IN (
         SELECT friend_id FROM friendships WHERE user_id = $1
       )
       ORDER BY tc.created_at DESC
       LIMIT 20`,
      [userId]
    );
    
    // Also get incomplete goals from friends that can be nudged
    const today = new Date().toISOString().split('T')[0];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    
    const incompleteGoals = await pool.query(
      `SELECT 
        g.id as goal_id,
        g.title as goal_title,
        g.category,
        g.frequency,
        u.id as friend_id,
        u.username as friend_username
       FROM goals g
       JOIN users u ON g.user_id = u.id
       WHERE g.user_id IN (
         SELECT friend_id FROM friendships WHERE user_id = $1
       )
       AND (
         (g.frequency = 'daily' AND g.id NOT IN (
           SELECT goal_id FROM task_completions WHERE user_id = u.id AND goal_id = g.id AND DATE(completed_date) = $2
         ))
         OR
         (g.frequency = 'weekly' AND g.id NOT IN (
           SELECT goal_id FROM task_completions WHERE user_id = u.id AND goal_id = g.id AND DATE(completed_date) >= $3
         ))
       )
       ORDER BY g.created_at DESC
       LIMIT 10`,
      [userId, today, startOfWeekStr]
    );
    
    res.json({ 
      feed: result.rows,
      incomplete_goals: incompleteGoals.rows 
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Server error fetching feed' });
  }
});

// Send a nudge to a friend
router.post('/nudge', async (req, res) => {
  const { from_user_id, to_user_id, goal_id } = req.body;
  
  try {
    // Validate input
    if (!from_user_id || !to_user_id || !goal_id) {
      return res.status(400).json({ error: 'From user, to user, and goal ID are required' });
    }
    
    // Verify friendship exists
    const friendshipCheck = await pool.query(
      'SELECT * FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [from_user_id, to_user_id]
    );
    
    if (friendshipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not friends with this user' });
    }
    
    // Get goal info for context
    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [goal_id, to_user_id]
    );
    
    if (goalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found or does not belong to this user' });
    }
    
    const goal = goalResult.rows[0];
    
    // Check if goal is already completed today (for daily) or this week (for weekly)
    const today = new Date().toISOString().split('T')[0];
    let isCompleted = false;
    
    if (goal.frequency === 'daily') {
      const completionCheck = await pool.query(
        'SELECT * FROM task_completions WHERE goal_id = $1 AND user_id = $2 AND completed_date = $3',
        [goal_id, to_user_id, today]
      );
      isCompleted = completionCheck.rows.length > 0;
    } else {
      // For weekly tasks, check if completed this week
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
      
      const completionCheck = await pool.query(
        'SELECT * FROM task_completions WHERE goal_id = $1 AND user_id = $2 AND completed_date >= $3',
        [goal_id, to_user_id, startOfWeekStr]
      );
      isCompleted = completionCheck.rows.length > 0;
    }
    
    // Only allow nudges for incomplete goals
    if (isCompleted) {
      return res.status(400).json({ error: 'This goal has already been completed. Nudges are only for incomplete goals.' });
    }
    
    // Generate AI nudge message
    const aiMessage = await generateMessage('nudge', {
      goal_type: goal.category || 'personal',
      goal_title: goal.title
    });
    
    // Insert nudge into database
    await pool.query(
      'INSERT INTO nudges (from_user_id, to_user_id, goal_id, ai_message) VALUES ($1, $2, $3, $4)',
      [from_user_id, to_user_id, goal_id, aiMessage]
    );
    
    // Check if sender unlocked any badges (like Helping Hand)
    await checkBadges(from_user_id);
    
    res.status(201).json({
      message: 'Nudge sent successfully',
      ai_message: aiMessage
    });
  } catch (error) {
    console.error('Error sending nudge:', error);
    res.status(500).json({ error: 'Server error sending nudge' });
  }
});

// Get nudges received by a user
router.get('/nudges/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT 
        n.id,
        n.ai_message,
        n.created_at,
        u.username as from_username,
        g.title as goal_title
       FROM nudges n
       JOIN users u ON n.from_user_id = u.id
       JOIN goals g ON n.goal_id = g.id
       WHERE n.to_user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 10`,
      [userId]
    );
    
    res.json({ nudges: result.rows });
  } catch (error) {
    console.error('Error fetching nudges:', error);
    res.status(500).json({ error: 'Server error fetching nudges' });
  }
});

// Remove a friend
router.delete('/remove-friend', async (req, res) => {
  const { user_id, friend_id } = req.body;
  
  try {
    // Delete both directions of friendship
    await pool.query(
      'DELETE FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [user_id, friend_id]
    );
    
    await pool.query(
      'DELETE FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [friend_id, user_id]
    );
    
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Server error removing friend' });
  }
});

module.exports = router;