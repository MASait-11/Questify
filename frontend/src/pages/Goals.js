/*
 * Goals Page Component
 * Allows users to create new goals and view/manage existing goals.
 * Shows list of all user goals with ability to complete tasks and delete goals.
 */

import React, { useState, useEffect, useCallback } from 'react';
import GoalCard from '../components/GoalCard';
import './Goals.css';

function Goals({ user }) {
  const [goals, setGoals] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all goals for user
  const fetchGoals = useCallback(async () => {
    if (!user || !user.id) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/goals/${user.id}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setGoals(data.goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Handle create goal form submission
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/goals/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id,
          title,
          description,
          category,
          frequency
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Goal created successfully!');
        setGoals([data.goal, ...goals]);
        
        // Reset form
        setTitle('');
        setDescription('');
        setCategory('');
        setFrequency('daily');
        
        // Hide form after 2 seconds
        setTimeout(() => {
          setShowCreateForm(false);
          setSuccess('');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create goal');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      setError('Network error. Please try again.');
    }
  };

  // Handle goal deletion
  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ user_id: user.id }),
      });

      const data = await response.json();
      console.log('Delete response:', response.status, data);

      if (response.ok) {
        // Remove goal from state
        setGoals(goals.filter(g => g.id !== goalId));
        console.log('Goal deleted successfully');
        // Reload page after a short delay to fully refresh
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.error('Delete failed:', data.error);
        alert(data.error || 'Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Error deleting goal: ' + error.message);
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
      <h1 className="page-title">My Goals 🎯</h1>

      {/* Create Goal Button */}
      <div className="create-goal-section">
        {!showCreateForm ? (
          <button 
            onClick={() => setShowCreateForm(true)} 
            className="create-goal-btn"
          >
            ➕ Create New Goal
          </button>
        ) : (
          <div className="card create-goal-form">
            <h3>Create New Goal</h3>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleCreateGoal}>
              <div className="form-group">
                <label>Goal Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Exercise daily"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your goal..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Fitness, Learning, Health"
                />
              </div>

              <div className="form-group">
                <label>Frequency *</label>
                <select 
                  value={frequency} 
                  onChange={(e) => setFrequency(e.target.value)}
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  Create Goal
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setError('');
                    setSuccess('');
                  }} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Goals List */}
      <div className="goals-container">
        {goals.length === 0 ? (
          <div className="empty-state card">
            <p>No goals yet. Create your first goal to get started! 🚀</p>
          </div>
        ) : (
          <div className="goals-grid">
            {goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                user={user}
                onGoalUpdate={fetchGoals}
                onGoalDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Goals;
