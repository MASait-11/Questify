/*
 * Friends Page Component
 * Allows users to add friends by username and view their friends list.
 * Shows friend activity and allows sending nudges.
 */

import React, { useState, useEffect } from 'react';
import './Friends.css';

function Friends({ user }) {
  const [friends, setFriends] = useState([]);
  const [friendUsername, setFriendUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      fetchFriends();
    }
  }, [user?.id]);

  // Fetch user's friends list
  const fetchFriends = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/social/friends/${user.id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setFriends(data.friends);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a friend
  const handleAddFriend = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/social/add-friend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id,
          friend_username: friendUsername
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully added ${friendUsername} as a friend!`);
        setFriendUsername('');
        fetchFriends(); // Refresh friends list
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to add friend');
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      setError('Network error. Please try again.');
    }
  };

  // Handle removing a friend
  const handleRemoveFriend = async (friendId, friendUsername) => {
    if (!window.confirm(`Remove ${friendUsername} from your friends?`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/social/remove-friend`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id,
          friend_id: friendId
        }),
      });

      if (response.ok) {
        setFriends(friends.filter(f => f.id !== friendId));
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Friends 👥</h1>

      {/* Add Friend Form */}
      <div className="card add-friend-section">
        <h3>Add a Friend</h3>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleAddFriend} className="add-friend-form">
          <input
            type="text"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            placeholder="Enter friend's username"
            required
          />
          <button type="submit" className="add-btn">
            Add Friend
          </button>
        </form>
      </div>

      {/* Friends List */}
      <div className="friends-section">
        <h3>Your Friends ({friends.length})</h3>
        
        {friends.length === 0 ? (
          <div className="empty-state card">
            <p>No friends yet. Add some friends to start competing! 🚀</p>
          </div>
        ) : (
          <div className="friends-grid">
            {friends.map((friend) => (
              <div key={friend.id} className="friend-card card">
                <div className="friend-header">
                  <div className="friend-avatar">
                    {friend.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="friend-info">
                    <h4>{friend.username}</h4>
                    <p className="friend-stats">
                      🔥 {friend.current_streak} day streak | 
                      ⭐ {friend.total_points} points
                    </p>
                  </div>
                </div>
                
                <div className="friend-actions">
                  <a 
                    href={`/profile?user=${friend.id}`} 
                    className="view-profile-btn"
                  >
                    View Profile
                  </a>
                  <button 
                    onClick={() => handleRemoveFriend(friend.id, friend.username)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Friends;
