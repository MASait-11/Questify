import React, { useState, useEffect } from 'react';
import NudgeButton from './NudgeButton';

/**
 * FriendFeed Component
 * Shows recent activity from friends
 * Displays task completions and allows sending nudges
 */
function FriendFeed({ user }) {
  const [feedItems, setFeedItems] = useState([]);
  const [incompleteGoals, setIncompleteGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedItems = React.useCallback(async () => {
    if (!user || !user.id) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/social/feed/${user.id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setFeedItems(data.feed || []);
      setIncompleteGoals(data.incomplete_goals || []);
    } catch (error) {
      console.error('Error fetching friend feed:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFeedItems();
  }, [fetchFeedItems]);

  if (!user || !user.id) {
    return (
      <div className="friend-feed">
        <p className="no-feed">User not loaded. Please refresh the page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="friend-feed">
        <div className="loading-feed">Loading activity...</div>
      </div>
    );
  }

  return (
    <div className="friend-feed">
      {/* Completed activities */}
      <div className="feed-items">
        {feedItems.length === 0 && incompleteGoals.length === 0 && (
          <p className="no-feed">No friend activity yet. Add friends to see their progress!</p>
        )}
        
        {feedItems.map((item) => (
          <div key={item.id} className="feed-item card">
            <div className="feed-header">
              <span className="feed-friend-name">
                <strong>{item.friend_username || item.username}</strong> completed a task
              </span>
              <span className="feed-time">
                {item.completed_date ? new Date(item.completed_date).toLocaleDateString() : ''}
              </span>
            </div>
            <p className="feed-goal">
              <span className="feed-emoji">✓</span>
              {item.goal_title}
            </p>
            <p className="feed-points">+{item.points_earned || item.points} points</p>
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                Already completed - no nudge needed
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Incomplete goals that can be nudged */}
      {incompleteGoals.length > 0 && (
        <div className="feed-items" style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#667eea', marginBottom: '15px', fontSize: '1.1em' }}>
            Friends working on these goals:
          </h4>
          {incompleteGoals.map((goal) => (
            <div key={`incomplete-${goal.goal_id}-${goal.friend_id}`} className="feed-item card" style={{ opacity: 0.9 }}>
              <div className="feed-header">
                <span className="feed-friend-name">
                  <strong>{goal.friend_username}</strong> is working on:
                </span>
              </div>
              <p className="feed-goal">
                <span className="feed-emoji">🎯</span>
                {goal.goal_title}
              </p>
              <p style={{ fontSize: '0.9em', color: '#666', margin: '8px 0 0 0' }}>
                Category: <strong>{goal.category}</strong> | Frequency: <strong>{goal.frequency}</strong>
              </p>
              <div style={{ marginTop: '12px' }}>
                {user && user.id ? (
                  <NudgeButton 
                    fromUserId={user.id}
                    friendId={goal.friend_id} 
                    goalId={goal.goal_id}
                    friendName={goal.friend_username}
                    onNudgeSent={fetchFeedItems}
                    goalCategory={goal.category}
                  />
                ) : (
                  <p style={{ fontSize: '0.9em', color: '#999', fontStyle: 'italic' }}>
                    Loading...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendFeed;

