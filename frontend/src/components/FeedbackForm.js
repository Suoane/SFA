import React, { useState } from 'react';
import axios from 'axios';
import './FeedbackForm.css';

const FeedbackForm = ({ onFeedbackAdded }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    courseCode: '',
    rating: '5',
    comments: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate student name
    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    } else if (formData.studentName.trim().length < 2) {
      newErrors.studentName = 'Name must be at least 2 characters';
    }

    // Validate course code
    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
    } else if (formData.courseCode.trim().length < 3) {
      newErrors.courseCode = 'Course code must be at least 3 characters';
    }

    // Validate comments
    if (!formData.comments.trim()) {
      newErrors.comments = 'Comments are required';
    } else if (formData.comments.trim().length < 10) {
      newErrors.comments = 'Comments must be at least 10 characters';
    }

    // Validate rating
    const ratingNum = parseInt(formData.rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${apiUrl}/feedback`, {
        studentName: formData.studentName.trim(),
        courseCode: formData.courseCode.trim(),
        rating: parseInt(formData.rating),
        comments: formData.comments.trim()
      });

      if (response.data.success) {
        // Show success message
        setSuccessMessage('✅ Feedback submitted successfully!');
        
        // Reset form
        setFormData({
          studentName: '',
          courseCode: '',
          rating: '5',
          comments: ''
        });
        
        // Clear errors
        setErrors({});
        
        // Notify parent component
        if (onFeedbackAdded) {
          onFeedbackAdded();
        }

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      const errorMessage = error.response?.data?.error 
        || 'Failed to submit feedback. Please try again.';
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <div className="form-header">
        <h2>📝 Submit Course Feedback</h2>
        <p>Share your experience and help us improve</p>
      </div>

      <form onSubmit={handleSubmit} className="feedback-form">
        {/* Student Name Field */}
        <div className="form-group">
          <label htmlFor="studentName">
            Student Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            className={errors.studentName ? 'error' : ''}
            placeholder="Enter your full name"
            disabled={isSubmitting}
          />
          {errors.studentName && (
            <span className="error-message">⚠️ {errors.studentName}</span>
          )}
        </div>

        {/* Course Code Field */}
        <div className="form-group">
          <label htmlFor="courseCode">
            Course Code <span className="required">*</span>
          </label>
          <input
            type="text"
            id="courseCode"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleChange}
            className={errors.courseCode ? 'error' : ''}
            placeholder="e.g., ICT101, BIT202"
            disabled={isSubmitting}
          />
          {errors.courseCode && (
            <span className="error-message">⚠️ {errors.courseCode}</span>
          )}
        </div>

        {/* Rating Field */}
        <div className="form-group">
          <label htmlFor="rating">
            Rating (1-5) <span className="required">*</span>
          </label>
          <select
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className={errors.rating ? 'error' : ''}
            disabled={isSubmitting}
          >
            <option value="5">⭐⭐⭐⭐⭐ (5) - Excellent</option>
            <option value="4">⭐⭐⭐⭐ (4) - Good</option>
            <option value="3">⭐⭐⭐ (3) - Average</option>
            <option value="2">⭐⭐ (2) - Below Average</option>
            <option value="1">⭐ (1) - Poor</option>
          </select>
          {errors.rating && (
            <span className="error-message">⚠️ {errors.rating}</span>
          )}
        </div>

        {/* Comments Field */}
        <div className="form-group">
          <label htmlFor="comments">
            Comments <span className="required">*</span>
          </label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            className={errors.comments ? 'error' : ''}
            placeholder="Share your feedback about the course (minimum 10 characters)"
            rows="5"
            disabled={isSubmitting}
          />
          <div className="char-count">
            {formData.comments.length} characters
          </div>
          {errors.comments && (
            <span className="error-message">⚠️ {errors.comments}</span>
          )}
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="alert alert-error">
            ❌ {errors.submit}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="submit-btn"
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Submitting...
            </>
          ) : (
            <>
              📤 Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;