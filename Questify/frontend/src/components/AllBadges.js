import React from 'react';

/**
 * AllBadges Component
 * Shows all remaining badges that can be earned (not yet earned)
 * Helps users understand what achievements are still available
 * Hides section if all badges are already earned
 */
function AllBadges({ earnedBadges = [] }) {
  const allBadges = {
    'First Steps': {
      emoji: '👣',
      description: 'Complete your first task',
      requirement: 'Complete 1 task',
      color: '#a8edea'
    },
    'Week Warrior': {
      emoji: '⚡',
      description: 'Maintain a 7-day streak',
      requirement: 'Reach a 7-day streak',
      color: '#fed6e3'
    },
    'Monthly Master': {
      emoji: '🌙',
      description: 'Reach a 30-day streak',
      requirement: 'Reach a 30-day streak',
      color: '#74b9ff'
    },
    'Goal Crusher': {
      emoji: '💪',
      description: 'Complete 5 different goals',
      requirement: 'Complete tasks for 5 different goals',
      color: '#a29bfe'
    },
    'Social Butterfly': {
      emoji: '🦋',
      description: 'Add 10 friends',
      requirement: 'Have 10 friends',
      color: '#fdcb6e'
    },
    'Helping Hand': {
      emoji: '🤝',
      description: 'Send 20 nudges to friends',
      requirement: 'Send 20 encouragement nudges',
      color: '#6c5ce7'
    },
    'Comeback Kid': {
      emoji: '🔥',
      description: 'Rebuild your streak after a setback',
      requirement: 'Rebuild your streak after losing one (reach at least 3 days)',
      color: '#ffeaa7'
    }
  };

  // Filter out earned badges to show only remaining ones
  // Check for both badge_name and name fields
  const remainingBadges = Object.entries(allBadges).filter(
    ([badgeName]) => !earnedBadges.some(b => (b.badge_name === badgeName) || (b.name === badgeName))
  );

  // Hide section if all badges are earned
  if (remainingBadges.length === 0) {
    return null;
  }

  return (
    <div className="all-badges">
      <h3 style={{ color: '#667eea', marginTop: '0' }}>🏅 Remaining Badges</h3>
      <p className="badges-intro" style={{ marginBottom: '20px', color: '#333', fontSize: '14px', fontWeight: '500' }}>
        Here are the badges you can still earn. Keep working on your goals to unlock them!
      </p>
      <div className="badges-grid">
        {remainingBadges.map(([badgeName, badgeInfo]) => (
          <div key={badgeName} className="badge-card" style={{ borderLeft: `4px solid ${badgeInfo.color}` }}>
            <div className="badge-emoji" style={{ fontSize: '32px', marginBottom: '8px' }}>{badgeInfo.emoji}</div>
            <div className="badge-content">
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#222', fontWeight: '600' }}>{badgeName}</h4>
              <p className="badge-desc" style={{ margin: '0 0 8px 0', color: '#555', fontSize: '13px' }}>{badgeInfo.description}</p>
              <p className="badge-requirement" style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                <strong>Requirement:</strong> {badgeInfo.requirement}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllBadges;

