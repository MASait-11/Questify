import React from 'react';

/**
 * ProgressBar Component
 * Visual representation of task completion progress
 * Shows completed vs total tasks with a colored bar
 */
function ProgressBar({ completed, total, percentage, color = '#667eea' }) {
  const displayPercentage = Math.round(percentage || (total > 0 ? (completed / total) * 100 : 0));

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-info">
        <span className="progress-text">
          {completed}/{total} completed
        </span>
        <span className="progress-percentage">{displayPercentage}%</span>
      </div>
      <div className="progress-bar-background">
        <div
          className="progress-bar-fill"
          style={{
            width: `${displayPercentage}%`,
            backgroundColor: color,
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;

