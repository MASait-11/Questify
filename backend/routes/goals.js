/*
 * Goals Routes
 * Handles creating goals, completing tasks, fetching goals, and progress tracking.
 * Includes failure alert calculation and progress bar data.
 */

const express = require('express');
const pool = require('../db/config');
const { updateStreak } = require('../services/streakService');
const { checkBadges } = require('../services/badgeService');
const { generateMessage } = require('../services/gemini');
const router = express.Router();

// Create a new goal
router.post('/create', async (req, res) => {
  const { user_id, title, description, category, frequency, deadline } = req.body;
  
  try {
    // Validate required fields
    if (!user_id || !title || !frequency) {
      return res.status(400).json({ error: 'User ID, title, and frequency are required' });
    }
    
    // Validate frequency value
    if (frequency !== 'daily' && frequency !== 'weekly') {
      return res.status(400).json({ error: 'Frequency must be either "daily" or "weekly"' });
    }
    
    // Insert goal into database
    const result = await pool.query(
      'INSERT INTO goals (user_id, title, description, category, frequency, deadline) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, title, description, category, frequency, deadline]
    );
    
    res.status(201).json({
      message: 'Goal created successfully',
      goal: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Server error creating goal' });
  }
});

// Get all goals for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json({ goals: result.rows });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Server error fetching goals' });
  }
});

// Complete a task (daily or weekly)
router.post('/complete', async (req, res) => {
  const { goal_id, user_id, task_type } = req.body;
  
  try {
    // Validate input
    if (!goal_id || !user_id || !task_type) {
      return res.status(400).json({ error: 'Goal ID, user ID, and task type are required' });
    }
    
    // Determine points based on task type
    const points = task_type === 'daily' ? 10 : 50;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if task already completed today (for daily) or this week (for weekly)
    let checkQuery;
    if (task_type === 'daily') {
      checkQuery = await pool.query(
        'SELECT * FROM task_completions WHERE goal_id = $1 AND user_id = $2 AND completed_date = $3',
        [goal_id, user_id, today]
      );
    } else {
      // For weekly tasks, check if completed in current week
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
      
      checkQuery = await pool.query(
        'SELECT * FROM task_completions WHERE goal_id = $1 AND user_id = $2 AND completed_date >= $3',
        [goal_id, user_id, startOfWeekStr]
      );
    }
    
    // If already completed, don't allow duplicate completion
    if (checkQuery.rows.length > 0) {
      return res.status(400).json({ error: 'Task already completed for this period' });
    }
    
    // Insert task completion
    await pool.query(
      'INSERT INTO task_completions (goal_id, user_id, completed_date, points_earned) VALUES ($1, $2, $3, $4)',
      [goal_id, user_id, today, points]
    );
    
    // Update user's total points
    await pool.query(
      'UPDATE users SET total_points = total_points + $1 WHERE id = $2',
      [points, user_id]
    );
    
    // Update monthly leaderboard
    await pool.query(
      'INSERT INTO monthly_leaderboard (user_id, points) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET points = monthly_leaderboard.points + $2, last_updated = CURRENT_TIMESTAMP',
      [user_id, points]
    );
    
    // Update streak
    const newStreak = await updateStreak(user_id);
    
    // Check for new badges
    const newBadges = await checkBadges(user_id);
    
    // Get goal info for AI message context
    const goalResult = await pool.query('SELECT * FROM goals WHERE id = $1', [goal_id]);
    const goal = goalResult.rows[0];
    
    // Generate AI celebration message
    const aiMessage = await generateMessage('completion', { 
      goal_type: goal.category || 'personal' 
    });
    
    // Generate badge messages if any were unlocked
    const badgeMessages = [];
    for (const badge of newBadges) {
      const badgeMsg = await generateMessage('badge_unlock', { badge_name: badge });
      badgeMessages.push({ badge, message: badgeMsg });
    }
    
    res.json({
      success: true,
      points,
      new_streak: newStreak,
      badges_unlocked: badgeMessages,
      ai_message: aiMessage
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Server error completing task' });
  }
});

// Get progress bar data (daily and weekly completion rates)
router.get('/progress/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get start of current week (Sunday)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    
    // Count daily goals
    const dailyGoalsResult = await pool.query(
      'SELECT COUNT(*) FROM goals WHERE user_id = $1 AND frequency = $2',
      [userId, 'daily']
    );
    const totalDailyGoals = parseInt(dailyGoalsResult.rows[0].count);
    
    // Count completed daily tasks today (distinct goals completed)
    const completedDailyResult = await pool.query(
      `SELECT COUNT(DISTINCT tc.goal_id) FROM task_completions tc
       JOIN goals g ON tc.goal_id = g.id
       WHERE tc.user_id = $1 AND g.frequency = $2 AND DATE(tc.completed_date) = $3`,
      [userId, 'daily', today]
    );
    let completedDailyTasks = parseInt(completedDailyResult.rows[0].count);
    // Ensure completed never exceeds total
    completedDailyTasks = Math.min(completedDailyTasks, totalDailyGoals);
    
    // Count weekly goals
    const weeklyGoalsResult = await pool.query(
      'SELECT COUNT(*) FROM goals WHERE user_id = $1 AND frequency = $2',
      [userId, 'weekly']
    );
    const totalWeeklyGoals = parseInt(weeklyGoalsResult.rows[0].count);
    
    // Count completed weekly tasks this week (distinct goals completed)
    const completedWeeklyResult = await pool.query(
      `SELECT COUNT(DISTINCT tc.goal_id) FROM task_completions tc
       JOIN goals g ON tc.goal_id = g.id
       WHERE tc.user_id = $1 AND g.frequency = $2 AND DATE(tc.completed_date) >= $3`,
      [userId, 'weekly', startOfWeekStr]
    );
    let completedWeeklyTasks = parseInt(completedWeeklyResult.rows[0].count);
    // Ensure completed never exceeds total
    completedWeeklyTasks = Math.min(completedWeeklyTasks, totalWeeklyGoals);
    
    // Calculate percentages
    const dailyProgress = totalDailyGoals > 0 
      ? Math.round((completedDailyTasks / totalDailyGoals) * 100) 
      : 0;
    
    const weeklyProgress = totalWeeklyGoals > 0 
      ? Math.round((completedWeeklyTasks / totalWeeklyGoals) * 100) 
      : 0;
    
    res.json({
      daily: {
        completed: completedDailyTasks,
        total: totalDailyGoals,
        percentage: dailyProgress
      },
      weekly: {
        completed: completedWeeklyTasks,
        total: totalWeeklyGoals,
        percentage: weeklyProgress
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Server error fetching progress' });
  }
});

// Get failure alerts for user (goals they're falling behind on)
router.get('/failure-alerts/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get all goals with deadlines
    const goalsResult = await pool.query(
      'SELECT * FROM goals WHERE user_id = $1 AND deadline IS NOT NULL',
      [userId]
    );
    
    const alerts = [];
    const today = new Date();
    
    for (const goal of goalsResult.rows) {
      const deadline = new Date(goal.deadline);
      const createdAt = new Date(goal.created_at);
      
      // Skip if deadline has passed
      if (today >= deadline) {
        continue;
      }
      
      // Calculate total days for the goal
      const totalDays = Math.ceil((deadline - createdAt) / (1000 * 60 * 60 * 24));
      
      // Calculate days passed
      const daysPassed = Math.ceil((today - createdAt) / (1000 * 60 * 60 * 24));
      
      // Calculate expected completion rate
      const expectedRate = daysPassed / totalDays;
      
      // Count total tasks completed for this goal
      const completionsResult = await pool.query(
        'SELECT COUNT(*) FROM task_completions WHERE goal_id = $1',
        [goal.id]
      );
      const completedTasks = parseInt(completionsResult.rows[0].count);
      
      // Estimate total tasks needed (assume daily tasks)
      const tasksNeeded = goal.frequency === 'daily' ? totalDays : Math.ceil(totalDays / 7);
      
      // Calculate actual completion rate
      const actualRate = tasksNeeded > 0 ? completedTasks / tasksNeeded : 0;
      
      // If user is 20% or more behind schedule, create alert
      if (expectedRate - actualRate >= 0.2) {
        const daysBehind = Math.ceil((expectedRate - actualRate) * totalDays);
        
        // Generate AI message for this failure alert
        const aiMessage = await generateMessage('failure_alert', {
          goal_type: goal.category || 'personal'
        });
        
        alerts.push({
          goal_id: goal.id,
          goal_title: goal.title,
          days_behind: daysBehind,
          expected_completion: Math.round(expectedRate * 100),
          actual_completion: Math.round(actualRate * 100),
          ai_message: aiMessage
        });
      }
    }
    
    res.json({ alerts });
  } catch (error) {
    console.error('Error calculating failure alerts:', error);
    res.status(500).json({ error: 'Server error calculating alerts' });
  }
});

// Delete a goal
router.delete('/:goalId', async (req, res) => {
  const { goalId } = req.params;
  const { user_id } = req.body;
  
  try {
    // Verify goal belongs to user
    const goalResult = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
      [goalId, user_id]
    );
    
    if (goalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found or unauthorized' });
    }
    
    // Get all task completions for this goal to refund points
    const completionsResult = await pool.query(
      'SELECT COUNT(*) as completion_count FROM task_completions WHERE goal_id = $1',
      [goalId]
    );
    
    const completionCount = parseInt(completionsResult.rows[0].completion_count);
    const goal = goalResult.rows[0];
    
    // Calculate points to refund
    const pointsPerCompletion = goal.frequency === 'daily' ? 10 : 50;
    const pointsToRefund = completionCount * pointsPerCompletion;
    
    // Refund points to user
    if (pointsToRefund > 0) {
      await pool.query(
        'UPDATE users SET total_points = total_points - $1 WHERE id = $2',
        [pointsToRefund, user_id]
      );
      
      // Update monthly_leaderboard (only if row exists)
      await pool.query(
        'UPDATE monthly_leaderboard SET points = GREATEST(0, points - $1) WHERE user_id = $2',
        [pointsToRefund, user_id]
      );
      
      // Update leaderboard_history (only if row exists)
      await pool.query(
        'UPDATE leaderboard_history SET final_points = GREATEST(0, final_points - $1) WHERE user_id = $2',
        [pointsToRefund, user_id]
      );
    }
    
    // Delete goal (cascades to task_completions and nudges via foreign keys)
    await pool.query('DELETE FROM goals WHERE id = $1', [goalId]);
    
    res.json({ message: 'Goal deleted successfully', points_refunded: pointsToRefund });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Server error deleting goal' });
  }
});

module.exports = router;