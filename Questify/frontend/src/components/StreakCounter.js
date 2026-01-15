import React from 'react';

/**
 * StreakCounter Component
 * Displays user's current and longest streaks
 * Shows motivational messages based on streak length
 */
function StreakCounter({ currentStreak, longestStreak }) {
  // Determine motivational message based on streak length
  const getMotivationalMessage = () => {
    if (currentStreak === 0) {
      return 'Start your streak today! 🚀';
    } else if (currentStreak === 1) {
      return 'Great start! 🌱';
    } else if (currentStreak < 7) {
      return 'You\'re on fire! 🔥';
    } else if (currentStreak < 30) {
      return 'Week warrior! ⚡';
    } else {
      return 'Unstoppable! 💪';
    }
  };

  // Determine emoji based on streak length
  const getStreakEmoji = () => {
    if (currentStreak === 0) return '⭕';
    if (currentStreak < 7) return '🌱';
    if (currentStreak < 30) return '⚡';
    if (currentStreak < 100) return '🔥';
    return '👑';
  };

  return (
    <div className="streak-counter">
      <div className="streak-item">
        <div className="streak-emoji">{getStreakEmoji()}</div>
        <div className="streak-info">
          <h3>Current Streak</h3>
          <p className="streak-number">{currentStreak}</p>
          <p className="streak-days">days</p>
        </div>
      </div>

      <div className="streak-divider"></div>

      <div className="streak-item">
        <div className="streak-emoji">👑</div>
        <div className="streak-info">
          <h3>Longest Streak</h3>
          <p className="streak-number">{longestStreak}</p>
          <p className="streak-days">days</p>
        </div>
      </div>

      <div className="streak-message">
        <p>{getMotivationalMessage()}</p>
      </div>
    </div>
  );
}

export default StreakCounter;

