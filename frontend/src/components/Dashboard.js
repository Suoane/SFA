import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ refresh }) => {
  const [stats, setStats] = useState({
    totalfeedback: 0,
    averagerating: 0,
    highestrating: 0,
    lowestrating: 0,
    totalCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [refresh]);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/dashboard/stats`);
      
      if (response.data.success) {
        // Handle PostgreSQL returned data (lowercase keys)
        const data = response.data.data;
        setStats({
          totalfeedback: parseInt(data.totalfeedback) || 0,
          averagerating: parseFloat(data.averagerating) || 0,
          highestrating: parseInt(data.highestrating) || 0,
          lowestrating: parseInt(data.lowestrating) || 0,
          totalCourses: parseInt(data.totalCourses) || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceLevel = (avgRating) => {
    if (avgRating >= 4.5) return { text: 'Outstanding', emoji: '🌟' };
    if (avgRating >= 4) return { text: 'Excellent', emoji: '⭐' };
    if (avgRating >= 3) return { text: 'Good', emoji: '👍' };
    if (avgRating >= 2) return { text: 'Fair', emoji: '😐' };
    return { text: 'Needs Improvement', emoji: '📈' };
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="spinner-large"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="alert alert-error">
          ❌ {error}
        </div>
      </div>
    );
  }

  const performance = getPerformanceLevel(stats.averagerating);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Feedback Dashboard</h2>
        <p>Real-time statistics and insights</p>
      </div>

      <div className="stats-grid">
        {/* Total Feedback Card */}
        <div className="stat-card card-primary">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>Total Feedback</h3>
            <p className="stat-value">{stats.totalfeedback}</p>
            <span className="stat-label">Submissions</span>
          </div>
        </div>

        {/* Average Rating Card */}
        <div className="stat-card card-success">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Average Rating</h3>
            <p className="stat-value">
              {stats.averagerating > 0 
                ? parseFloat(stats.averagerating).toFixed(2) 
                : '0.00'}
            </p>
            <span className="stat-label">
              {performance.emoji} {performance.text}
            </span>
          </div>
        </div>

        {/* Highest Rating Card */}
        <div className="stat-card card-info">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>Highest Rating</h3>
            <p className="stat-value">
              {stats.highestrating > 0 ? stats.highestrating : '-'}
            </p>
            <span className="stat-label">
              {stats.highestrating > 0 ? '⭐'.repeat(stats.highestrating) : 'No ratings yet'}
            </span>
          </div>
        </div>

        {/* Lowest Rating Card */}
        <div className="stat-card card-warning">
          <div className="stat-icon">📉</div>
          <div className="stat-content">
            <h3>Lowest Rating</h3>
            <p className="stat-value">
              {stats.lowestrating > 0 ? stats.lowestrating : '-'}
            </p>
            <span className="stat-label">
              {stats.lowestrating > 0 ? '⭐'.repeat(stats.lowestrating) : 'No ratings yet'}
            </span>
          </div>
        </div>

        {/* Total Courses Card */}
        <div className="stat-card card-purple">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Courses Reviewed</h3>
            <p className="stat-value">{stats.totalCourses}</p>
            <span className="stat-label">Unique Courses</span>
          </div>
        </div>

        {/* Engagement Card */}
        <div className="stat-card card-gradient">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Engagement</h3>
            <p className="stat-value">
              {stats.totalfeedback > 0 ? 'Active' : 'Starting'}
            </p>
            <span className="stat-label">
              {stats.totalfeedback >= 10 ? 'High participation! 🎉' : 'Keep it up! 💪'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      {stats.totalfeedback > 0 && (
        <div className="performance-summary">
          <h3>📋 Performance Summary</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Total Responses:</span>
              <span className="summary-value">{stats.totalfeedback}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Score:</span>
              <span className="summary-value">
                {parseFloat(stats.averagerating).toFixed(2)} / 5.00
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Performance:</span>
              <span className="summary-value performance-badge">
                {performance.emoji} {performance.text}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;