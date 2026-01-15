import React, { useState } from 'react';

/**
 * GoalCard Component
 * Displays individual goal with progress and action buttons
 * Allows completing tasks and deleting goals
 */
function GoalCard({ goal, user, onGoalUpdate, onGoalDelete }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState('');

  // Get category emoji
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'fitness': '💪',
      'health': '🏥',
      'learning': '📚',
      'work': '💼',
      'personal': '✨',
      'finance': '💰',
      'social': '🤝',
      'hobby': '🎨',
      default: '🎯'
    };
    return emojiMap[category?.toLowerCase()] || emojiMap.default;
  };

  // Get frequency display
  const getFrequencyDisplay = () => {
    return goal.frequency === 'daily' ? 'Daily' : 'Weekly';
  };

  // Handle task completion
  const handleCompleteTask = async () => {
    setIsCompleting(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/goals/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          goal_id: goal.id,
          user_id: user.id,
          task_type: goal.frequency
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onGoalUpdate(goal.id);
      } else {
        setError(data.error || 'Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle goal deletion
  const handleDeleteGoal = async () => {
    if (!window.confirm(`Delete goal "${goal.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/goals/${goal.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ user_id: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        onGoalDelete(goal.id);
      } else {
        setError(data.error || 'Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Network error. Please try again.');
    }
  };

  const points = goal.frequency === 'daily' ? 10 : 50;

  return (
    <div className="goal-card card">
      <div className="goal-card-header">
        <div className="goal-title-section">
          <span className="goal-category-emoji">{getCategoryEmoji(goal.category)}</span>
          <h3 className="goal-title">{goal.title}</h3>
        </div>
        <span className="goal-frequency-badge">{getFrequencyDisplay()}</span>
      </div>

      {goal.description && (
        <p className="goal-description">{goal.description}</p>
      )}

      {goal.category && (
        <p className="goal-category">
          <strong>Category:</strong> {goal.category}
        </p>
      )}

      <div className="goal-card-footer">
        <div className="goal-points">
          <span className="points-label">Points for completion:</span>
          <span className="points-value">+{points} pts</span>
        </div>
        <div className="goal-actions">
          <button
            className="btn-complete"
            onClick={handleCompleteTask}
            disabled={isCompleting}
          >
            {isCompleting ? 'Completing...' : 'Complete'}
          </button>
          <button
            className="btn-delete"
            onClick={handleDeleteGoal}
          >
            Delete
          </button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default GoalCard;

