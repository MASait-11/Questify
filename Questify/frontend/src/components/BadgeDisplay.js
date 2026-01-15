import React from 'react';

/**
 * BadgeDisplay Component
 * Shows all badges earned by a user
 * Displays badge name, description, and unlock date
 */
function BadgeDisplay({ badges = [] }) {
  // Define badge information
  const badgeInfo = {
    'First Steps': {
      emoji: '👣',
      description: 'Complete your first task',
      color: '#a8edea'
    },
    'Week Warrior': {
      emoji: '⚡',
      description: 'Maintain a 7-day streak',
      color: '#fed6e3'
    },
    'Monthly Master': {
      emoji: '🌙',
      description: 'Reach a 30-day streak',
      color: '#74b9ff'
    },
    'Goal Crusher': {
      emoji: '💪',
      description: 'Complete 5 different goals',
      color: '#a29bfe'
    },
    'Social Butterfly': {
      emoji: '🦋',
      description: 'Add 10 friends',
      color: '#fdcb6e'
    },
    'Helping Hand': {
      emoji: '🤝',
      description: 'Send 20 nudges to friends',
      color: '#6c5ce7'
    },
    'Comeback Kid': {
      emoji: '🔥',
      description: 'Rebuild your streak after a setback',
      color: '#ffeaa7'
    }
  };

  if (badges.length === 0) {
    return (
      <div className="badge-display">
        <h3>🏅 Badges</h3>
        <div className="no-badges">
          <p>No badges earned yet. Keep working on your goals!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="badge-display">
      <h3>🏅 Badges ({badges.length})</h3>
      <div className="badges-grid">
        {badges.map((badge) => {
          const info = badgeInfo[badge.badge_type] || {
            emoji: '⭐',
            description: 'Special achievement',
            color: '#dfe6e9'
          };

          return (
            <div key={badge.id} className="badge-card" style={{ borderLeft: `4px solid ${info.color}` }}>
              <div className="badge-emoji">{info.emoji}</div>
              <div className="badge-content">
                <h4>{badge.badge_type}</h4>
                <p className="badge-desc">{info.description}</p>
                {badge.unlocked_at && (
                  <p className="badge-date">
                    {new Date(badge.unlocked_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BadgeDisplay;

