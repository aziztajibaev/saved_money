const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { dbRun, dbGet } = require('../utils/dbHelpers');
require('dotenv').config();

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { username, email, password, initialBalance = 0 } = req.body;

      // Check if user already exists
      const existingUser = await dbGet(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or username already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await dbRun(
        `INSERT INTO users (username, email, password, initial_balance, current_balance)
         VALUES (?, ?, ?, ?, ?)`,
        [username, email, hashedPassword, initialBalance, initialBalance]
      );

      // Create default categories for the user
      const defaultCategories = [
        // Income categories
        { name: 'Ish haqi', type: 'income', icon: '💼', color: '#10b981' },
        { name: 'Biznes', type: 'income', icon: '💰', color: '#059669' },
        { name: 'Boshqa kirim', type: 'income', icon: '📈', color: '#34d399' },
        // Expense categories
        { name: 'Oziq-ovqat', type: 'expense', icon: '🍔', color: '#ef4444' },
        { name: 'Transport', type: 'expense', icon: '🚗', color: '#f97316' },
        { name: 'Uy-joy', type: 'expense', icon: '🏠', color: '#eab308' },
        { name: 'Kommunal', type: 'expense', icon: '💡', color: '#84cc16' },
        { name: 'Shaxsiy', type: 'expense', icon: '👤', color: '#06b6d4' },
        { name: 'O\'yin-kulgi', type: 'expense', icon: '🎮', color: '#8b5cf6' },
        { name: 'Sog\'liq', type: 'expense', icon: '⚕️', color: '#ec4899' },
        { name: 'Ta\'lim', type: 'expense', icon: '📚', color: '#3b82f6' },
        { name: 'Boshqa', type: 'expense', icon: '📦', color: '#6b7280' }
      ];

      for (const category of defaultCategories) {
        await dbRun(
          `INSERT INTO categories (user_id, name, type, icon, color, is_default)
           VALUES (?, ?, ?, ?, ?, 1)`,
          [result.id, category.name, category.type, category.icon, category.color]
        );
      }

      // Create default accounts (Card and Cash)
      await dbRun(
        `INSERT INTO accounts (user_id, name, type, balance, currency)
         VALUES (?, ?, ?, ?, ?)`,
        [result.id, 'Karta', 'card', 0, 'UZS']
      );

      await dbRun(
        `INSERT INTO accounts (user_id, name, type, balance, currency)
         VALUES (?, ?, ?, ?, ?)`,
        [result.id, 'Naqd pul', 'cash', initialBalance, 'UZS']
      );

      // Generate JWT token
      const token = jwt.sign(
        { userId: result.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          userId: result.id,
          username,
          email,
          token
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = await dbGet(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          userId: user.id,
          username: user.username,
          email: user.email,
          currentBalance: user.current_balance,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: error.message
      });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = await dbGet(
        'SELECT id, username, email, initial_balance, current_balance, created_at FROM users WHERE id = ?',
        [req.userId]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching profile',
        error: error.message
      });
    }
  }
};

module.exports = authController;
