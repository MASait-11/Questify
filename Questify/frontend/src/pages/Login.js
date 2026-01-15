/*
 * Login Page Component
 * Handles user authentication with username and password.
 * Redirects to dashboard on successful login.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validate input
  const validateInput = () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return false;
    }
    return true;
  };

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateInput()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        setUser(data.user);
        navigate('/dashboard');
      } else {
        // Login failed
        setError(data.error || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">🎯 Questify</h1>
            <h2 className="auth-subtitle">Welcome Back</h2>
            <p className="auth-description">Track your goals and compete with friends</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
                autoComplete="username"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
                className="form-input"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Create one</Link></p>
          </div>
        </div>

        <div className="auth-benefits">
          <h3>Why Join?</h3>
          <ul>
            <li><span className="benefit-icon">✓</span> Track unlimited goals</li>
            <li><span className="benefit-icon">✓</span> Compete on leaderboards</li>
            <li><span className="benefit-icon">✓</span> Earn badges & achievements</li>
            <li><span className="benefit-icon">✓</span> AI-powered encouragement</li>
            <li><span className="benefit-icon">✓</span> Connect with friends</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;
