/*
 * Leaderboard Page Component
 * Displays monthly and all-time leaderboards.
 * Shows user rankings and allows toggling between views.
 */

import React, { useState, useEffect } from 'react';
import './LeaderboardPage.css';

function LeaderboardPage({ user }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      fetchLeaderboardData();
    }
  }, [user?.id]);

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    try {
      // Fetch current monthly leaderboard
      const currentRes = await fetch(`${process.env.REACT_APP_API_URL}/api/leaderboard/current?user_id=${user.id}`, {
        credentials: 'include'
      });
      
      if (!currentRes.ok) {
        console.error('Leaderboard API error:', currentRes.status, currentRes.statusText);
        return;
      }
      
      const currentData = await currentRes.json();
      console.log('Leaderboard API Response:', currentData);
      setLeaderboard(currentData.leaderboard || []);
      setUserRank(currentData.user_rank);

      // Fetch historical data
      const historyRes = await fetch(`${process.env.REACT_APP_API_URL}/api/leaderboard/history/${user.id}`, {
        credentials: 'include'
      });
      const historyData = await historyRes.json();
      setHistory(historyData.history || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get medal emoji for rank
  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🔢';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">🏆 Leaderboard</h1>

      {/* Tabs */}
      <div className="leaderboard-tabs">
        <button
          className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          📅 This Month
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📊 History
        </button>
      </div>

      {/* Current Leaderboard Tab */}
      {activeTab === 'current' && (
        <div className="leaderboard-content">
          {/* User's Current Rank */}
          {userRank && (
            <div className="user-rank-card card">
              <h3>Your Rank</h3>
              <div className="rank-display">
                <div className="rank-medal">
                  {getMedalEmoji(userRank.rank)}
                </div>
                <div className="rank-info">
                  <p className="rank-position">#{userRank.rank}</p>
                  <p className="rank-points">{userRank.points} points</p>
                </div>
              </div>
            </div>
          )}

          {/* Top Players Table */}
          <div className="leaderboard-table-container card">
            <h3>🏆 Top Players</h3>
            {leaderboard && Array.isArray(leaderboard) && leaderboard.length > 0 ? (
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Points</th>
                    <th>Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.user_id}
                      className={`leaderboard-row ${parseInt(entry.user_id) === parseInt(user.id) ? 'current-user' : ''}`}
                    >
                      <td className="rank-cell">
                        <span className="medal">{getMedalEmoji(parseInt(entry.rank) || 0)}</span>
                        <span className="rank-number">#{entry.rank || 0}</span>
                      </td>
                      <td className="player-cell">
                        <strong>{entry.username || 'Unknown'}</strong>
                      </td>
                      <td className="points-cell">
                        <span className="points-badge">{entry.points || 0}</span>
                      </td>
                      <td className="streak-cell">
                        <span className="streak-badge">
                          🔥 {entry.current_streak || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">
                <p>No leaderboard data available yet.</p>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                  {leaderboard && leaderboard.length === 0 
                    ? 'No players have earned points yet. Complete some tasks to appear on the leaderboard!'
                    : 'Complete some tasks to earn points and appear on the leaderboard!'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="leaderboard-content">
          <div className="history-container">
            {history.length > 0 ? (
              <div>
                <h3>📈 Your Past Rankings</h3>
                <div className="history-grid">
                  {history.map((entry) => (
                    <div key={entry.id} className="history-card card">
                      <h4 className="history-month">
                        {monthNames[entry.month - 1]} {entry.year}
                      </h4>
                      <div className="history-content">
                        <div className="history-item">
                          <span className="history-label">Rank</span>
                          <span className="history-value">
                            {getMedalEmoji(entry.rank)} #{entry.rank}
                          </span>
                        </div>
                        <div className="history-item">
                          <span className="history-label">Points</span>
                          <span className="history-value">{entry.final_points}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card">
                <p className="no-data">No ranking history yet. Start earning points!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaderboardPage;
