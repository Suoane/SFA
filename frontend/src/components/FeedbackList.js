import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedbackList.css';

const FeedbackList = ({ refresh, onFeedbackDeleted }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, [refresh]);

  // Fetch all feedback from API
  const fetchFeedbacks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/feedback`);
      
      if (response.data.success) {
        setFeedbacks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('Failed to load feedback. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Delete feedback
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    setDeletingId(id);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.delete(`${apiUrl}/feedback/${id}`);
      
      if (response.data.success) {
        // Remove from local state
        setFeedbacks(feedbacks.filter(f => f.id !== id));
        
        // Notify parent component
        if (onFeedbackDeleted) {
          onFeedbackDeleted();
        }
        
        alert('✅ Feedback deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('❌ Failed to delete feedback. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get rating color class
  const getRatingClass = (rating) => {
    if (rating >= 4) return 'rating-excellent';
    if (rating === 3) return 'rating-good';
    return 'rating-poor';
  };

  if (loading) {
    return (
      <div className="feedback-list-container">
        <div className="loading">
          <div className="spinner-large"></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feedback-list-container">
        <div className="alert alert-error">
          ❌ {error}
          <button onClick={fetchFeedbacks} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-list-container">
      <div className="list-header">
        <h2>📚 All Feedback</h2>
        <div className="feedback-count">
          <span className="count-badge">{feedbacks.length}</span>
          {feedbacks.length === 1 ? 'Submission' : 'Submissions'}
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="no-feedback">
          <div className="no-feedback-icon">📭</div>
          <h3>No feedback yet</h3>
          <p>Be the first to submit your course feedback!</p>
        </div>
      ) : (
        <div className="feedback-grid">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="feedback-card">
              <div className="card-header">
                <div className="student-info">
                  <div className="avatar">
                    {feedback.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{feedback.studentName}</h3>
                    <span className="course-code">
                      {feedback.courseCode}
                    </span>
                  </div>
                </div>
                <div className={`rating ${getRatingClass(feedback.rating)}`}>
                  {renderStars(feedback.rating)}
                  <span className="rating-number">{feedback.rating}/5</span>
                </div>
              </div>

              <div className="card-body">
                <p className="comments">{feedback.comments}</p>
              </div>

              <div className="card-footer">
                <small className="date">
                  🕒 {formatDate(feedback.created_at)}
                </small>
                <button 
                  onClick={() => handleDelete(feedback.id)}
                  disabled={deletingId === feedback.id}
                  className="delete-btn"
                >
                  {deletingId === feedback.id ? (
                    <>
                      <span className="spinner-small"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      🗑️ Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;