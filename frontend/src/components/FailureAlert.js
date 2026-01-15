import React from 'react';

/**
 * FailureAlert Component
 * Shows warnings for goals the user is falling behind on
 * Provides encouragement and AI-generated personalized messages
 */
function FailureAlert({ alerts = [] }) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="failure-alerts">
      <div className="alerts-list">
        {alerts.map((alert) => (
          <div key={alert.goal_id} className="alert-item">
            <div className="alert-header">
              <span className="alert-icon">⏰</span>
              <span className="alert-title">{alert.goal_title}</span>
              {alert.days_behind && (
                <span className="alert-days-overdue">{alert.days_behind} days behind</span>
              )}
            </div>
            <p className="alert-message">
              {alert.ai_message || `Don't give up on "${alert.goal_title}"! You've got this! 💪`}
            </p>
            {alert.expected_completion !== undefined && alert.actual_completion !== undefined && (
              <p className="alert-stats">
                Expected: {alert.expected_completion}% | Actual: {alert.actual_completion}%
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FailureAlert;

