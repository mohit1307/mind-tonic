const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const corsOptions = require('./config/cors');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Request logging (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', generalLimiter);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Mind Tonic API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/dashboard', require('./routes/dashboard.routes'));
// app.use('/api/tasks', require('./routes/task.routes'));
// app.use('/api/schedule', require('./routes/schedule.routes'));
// app.use('/api/habits', require('./routes/habit.routes'));
// app.use('/api/ai', require('./routes/ai.routes'));
// app.use('/api/study', require('./routes/study.routes'));
// app.use('/api/documents', require('./routes/document.routes'));
// app.use('/api/expenses', require('./routes/expense.routes'));
// app.use('/api/notifications', require('./routes/notification.routes'));
// app.use('/api/analytics', require('./routes/analytics.routes'));

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
