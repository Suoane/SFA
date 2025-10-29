require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL Database Connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'feedback_db',
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database'))
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.log('Please check your database credentials in .env file');
    process.exit(1);
  });

// Error handling helper
const handleError = (res, err, message = 'Server error') => {
  console.error(message, err);
  res.status(500).json({
    error: message,
    details: err.message,
  });
};

// ==================== API ROUTES ====================

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Student Feedback API is running!',
    endpoints: {
      'GET /api/feedback': 'Get all feedback',
      'GET /api/feedback/:id': 'Get single feedback',
      'POST /api/feedback': 'Add new feedback',
      'DELETE /api/feedback/:id': 'Delete feedback',
      'GET /api/dashboard/stats': 'Get dashboard statistics',
    },
  });
});

// GET - Retrieve all feedback
app.get('/api/feedback', async (req, res) => {
  const query = `
    SELECT 
      id,
      studentname AS "studentName",
      coursecode AS "courseCode",
      comments,
      rating,
      created_at
    FROM feedback
    ORDER BY created_at DESC
  `;
  try {
    const result = await pool.query(query);
    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (err) {
    handleError(res, err, 'Failed to retrieve feedback');
  }
});

// GET - Retrieve single feedback by ID
app.get('/api/feedback/:id', async (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      id,
      studentname AS "studentName",
      coursecode AS "courseCode",
      comments,
      rating,
      created_at
    FROM feedback
    WHERE id = $1
  `;
  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found',
      });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    handleError(res, err, 'Failed to retrieve feedback');
  }
});

// POST - Add new feedback
app.post('/api/feedback', async (req, res) => {
  const { studentName, courseCode, comments, rating } = req.body;

  if (!studentName || !courseCode || !comments || !rating) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required',
      required: ['studentName', 'courseCode', 'comments', 'rating'],
    });
  }

  const ratingNum = parseInt(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({
      success: false,
      error: 'Rating must be a number between 1 and 5',
    });
  }

  if (studentName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Student name cannot be empty',
    });
  }

  if (comments.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Comments must be at least 10 characters long',
    });
  }

  const query = `
    INSERT INTO feedback (studentname, coursecode, comments, rating)
    VALUES ($1, $2, $3, $4)
    RETURNING 
      id,
      studentname AS "studentName",
      coursecode AS "courseCode",
      comments,
      rating,
      created_at
  `;

  try {
    const result = await pool.query(query, [
      studentName.trim(),
      courseCode.trim(),
      comments.trim(),
      ratingNum,
    ]);
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: result.rows[0],
    });
  } catch (err) {
    handleError(res, err, 'Failed to add feedback');
  }
});

// DELETE - Remove feedback
app.delete('/api/feedback/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid feedback ID',
    });
  }

  const query = 'DELETE FROM feedback WHERE id = $1 RETURNING *';

  try {
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found',
      });
    }
    res.json({
      success: true,
      message: 'Feedback deleted successfully',
      deletedId: id,
    });
  } catch (err) {
    handleError(res, err, 'Failed to delete feedback');
  }
});

// GET - Dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) AS totalFeedback,
      ROUND(AVG(rating), 2) AS averageRating,
      MAX(rating) AS highestRating,
      MIN(rating) AS lowestRating,
      COUNT(DISTINCT coursecode) AS "totalCourses"
    FROM feedback
  `;
  try {
    const result = await pool.query(statsQuery);
    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    handleError(res, err, 'Failed to retrieve statistics');
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  pool.end(() => {
    console.log('✅ Database connection closed');
    process.exit(0);
  });
});
