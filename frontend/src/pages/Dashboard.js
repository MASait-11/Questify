/*
 * Dashboard Page Component
 * Main landing page after login showing overview of user's progress.
 * Displays progress bars, streak, recent activity, failure alerts, and motivational quote.
 */

import React, { useState, useEffect } from 'react';
import ProgressBar from '../components/ProgressBar';
import StreakCounter from '../components/StreakCounter';
import FailureAlert from '../components/FailureAlert';
import FriendFeed from '../components/FriendFeed';
import './Dashboard.css';

function Dashboard({ user }) {
  const [progress, setProgress] = useState(null);
  const [failureAlerts, setFailureAlerts] = useState([]);
  const [nudges, setNudges] = useState([]);
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      // Fetch progress bars data
      const progressRes = await fetch(`${process.env.REACT_APP_API_URL}/api/goals/progress/${user.id}`, {
        credentials: 'include'
      });
      
      if (!progressRes.ok) {
        console.error('Progress API error:', progressRes.status);
        return;
      }
      
      const progressData = await progressRes.json();
      console.log('Progress API Response:', progressData);
      setProgress(progressData);

      // Fetch failure alerts
      const alertsRes = await fetch(`${process.env.REACT_APP_API_URL}/api/goals/failure-alerts/${user.id}`, {
        credentials: 'include'
      });
      const alertsData = await alertsRes.json();
      setFailureAlerts(alertsData.alerts);

      // Fetch motivational quote (using Gemini API via backend)
      const quoteRes = await fetch(`${process.env.REACT_APP_API_URL}/api/gamification/quote`, {
        credentials: 'include'
      });
      if (quoteRes.ok) {
        const quoteData = await quoteRes.json();
        setQuote(quoteData.quote || 'Success is the sum of small efforts repeated day in and day out. 🌟');
      } else {
        setQuote('Success is the sum of small efforts repeated day in and day out. 🌟');
      }

      // Fetch nudges from friends
      const nudgesRes = await fetch(`${process.env.REACT_APP_API_URL}/api/social/nudges/${user.id}`, {
        credentials: 'include'
      });
      if (nudgesRes.ok) {
        const nudgesData = await nudgesRes.json();
        setNudges(nudgesData.nudges || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      <h1 className="page-title">Welcome back, {user.username}! 👋</h1>

      {/* Motivational Quote */}
      <div className="quote-card card">
        <p className="quote-text">{quote}</p>
      </div>

      {/* Progress Overview */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          <div className="card">
            <h3>📊 Today's Progress</h3>
            {progress ? (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h4>Daily Tasks</h4>
                  <ProgressBar 
                    completed={progress.daily?.completed || 0} 
                    total={progress.daily?.total || 0} 
                    percentage={progress.daily?.percentage || 0}
                    color="#667eea"
                  />
                </div>
                <div>
                  <h4>Weekly Tasks</h4>
                  <ProgressBar 
                    completed={progress.weekly?.completed || 0} 
                    total={progress.weekly?.total || 0} 
                    percentage={progress.weekly?.percentage || 0}
                    color="#2ecc71"
                  />
                </div>
              </div>
            ) : (
              <p>No progress data available. Complete some tasks to see your progress!</p>
            )}
          </div>

          <div className="card">
            <h3>🔥 Your Streak</h3>
            {user ? (
              <StreakCounter 
                currentStreak={user.current_streak || 0}
                longestStreak={user.longest_streak || 0}
              />
            ) : (
              <p>Loading streak data...</p>
            )}
          </div>

          {/* Failure Alerts */}
          {failureAlerts.length > 0 && (
            <div className="card alert-card">
              <h3>⚠️ Attention Needed</h3>
              <FailureAlert alerts={failureAlerts} />
            </div>
          )}

          {/* Nudges from Friends */}
          {nudges.length > 0 && (
            <div className="card nudges-card">
              <h3>💬 Nudges from Friends</h3>
              <div className="nudges-list">
                {nudges.slice(0, 5).map((nudge) => (
                  <div key={nudge.id} className="nudge-item">
                    <div className="nudge-header">
                      <strong>{nudge.from_username}</strong> on <em>{nudge.goal_title}</em>
                    </div>
                    <p className="nudge-message">{nudge.ai_message}</p>
                    <span className="nudge-time">
                      {new Date(nudge.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Friend Feed */}
        <div className="dashboard-right">
          <div className="card">
            <h3>👥 Friend Activity</h3>
            <FriendFeed user={user} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions card">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <a href="/goals" className="action-btn">
            ➕ Add New Goal
          </a>
          <a href="/friends" className="action-btn">
            👫 Find Friends
          </a>
          <a href="/leaderboard" className="action-btn">
            🏆 View Leaderboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
