import React, { useState, useEffect } from 'react';
import BadgeDisplay from '../components/BadgeDisplay';
import StreakCounter from '../components/StreakCounter';
import AllBadges from '../components/AllBadges';
import './Profile.css';

function Profile({ user, setUser }) {
  const [profileData, setProfileData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.id) {
      fetchProfileData();
    }
  }, [user?.id, window.location.search]);

  // Fetch user profile data
  const fetchProfileData = async () => {
    try {
      // Check if viewing friend's profile from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const profileUserId = urlParams.get('user') || user.id;
      
      // Fetch user stats
      const userRes = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/user/${profileUserId}`, {
        credentials: 'include'
      });
      const userData = await userRes.json();

      if (userRes.ok) {
        setProfileData(userData.user);
      }

      // Fetch badges
      const badgesRes = await fetch(`${process.env.REACT_APP_API_URL}/api/gamification/badges/${profileUserId}`, {
        credentials: 'include'
      });
      const badgesData = await badgesRes.json();

      if (badgesRes.ok) {
        setBadges(badgesData.badges || []);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="page-container">
        <div className="error-container">
          <p className="error-message">Could not load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">👤 Profile</h1>

      {/* User Info Card */}
      <div className="profile-grid">
        <div className="profile-main">
          <div className="card profile-header">
            <div className="profile-avatar">
              <span className="avatar-emoji">👤</span>
            </div>
            <div className="profile-info">
              <h2>{profileData.username || user.username}</h2>
              <p className="profile-email">{profileData.email}</p>
              {profileData.created_at && (
                <p className="profile-joined">
                  Joined {new Date(profileData.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>Total Points</h3>
                <p className="stat-value">{profileData.total_points}</p>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <h3>Current Streak</h3>
                <p className="stat-value">{profileData.current_streak}</p>
                <p className="stat-label">days</p>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-icon">👑</div>
              <div className="stat-content">
                <h3>Longest Streak</h3>
                <p className="stat-value">{profileData.longest_streak}</p>
                <p className="stat-label">days</p>
              </div>
            </div>
          </div>

          {/* Streak Counter Component */}
          <div className="card">
            <StreakCounter
              currentStreak={profileData.current_streak}
              longestStreak={profileData.longest_streak}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="profile-sidebar">
          {/* Badges Section */}
          <div className="card">
            <BadgeDisplay badges={badges} />
          </div>

          {/* All Available Badges */}
          <AllBadges earnedBadges={badges} />

          {/* Account Stats */}
          <div className="card account-stats">
            <h3>📊 Account Stats</h3>
            <ul>
              <li>
                <span>Account Age:</span>
                <strong>
                  {profileData.created_at
                    ? Math.floor(
                        (new Date() - new Date(profileData.created_at)) / (1000 * 60 * 60 * 24)
                      ) + ' days'
                    : 'N/A'}
                </strong>
              </li>
              <li>
                <span>Last Active:</span>
                <strong>
                  {profileData.last_activity_date
                    ? new Date(profileData.last_activity_date).toLocaleDateString()
                    : 'Never'}
                </strong>
              </li>
              <li>
                <span>Total Achievements:</span>
                <strong>{badges.length}</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

