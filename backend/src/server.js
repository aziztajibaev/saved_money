const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const budgetRoutes = require('./routes/budgets');
const debtRoutes = require('./routes/debts');
const transferRoutes = require('./routes/transfers');
const accountRoutes = require('./routes/accounts');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Finance Tracker API v1.0.0`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
