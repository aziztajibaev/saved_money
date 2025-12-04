const { dbRun, dbGet, dbAll } = require('../utils/dbHelpers');

const accountController = {
  // Get all accounts
  getAll: async (req, res) => {
    try {
      const userId = req.userId;

      const accounts = await dbAll(
        'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC',
        [userId]
      );

      res.json({
        success: true,
        data: accounts
      });
    } catch (error) {
      console.error('Get accounts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching accounts',
        error: error.message
      });
    }
  },

  // Create account
  create: async (req, res) => {
    try {
      const { name, type, balance = 0 } = req.body;
      const userId = req.userId;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: 'Name and type are required'
        });
      }

      if (!['card', 'cash'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "card" or "cash"'
        });
      }

      const result = await dbRun(
        `INSERT INTO accounts (user_id, name, type, balance, currency)
         VALUES (?, ?, ?, ?, 'UZS')`,
        [userId, name, type, balance]
      );

      // Update user's current balance
      await dbRun(
        `UPDATE users SET current_balance = (
          SELECT SUM(balance) FROM accounts WHERE user_id = ?
        ) WHERE id = ?`,
        [userId, userId]
      );

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          id: result.id,
          name,
          type,
          balance,
          currency: 'UZS'
        }
      });
    } catch (error) {
      console.error('Create account error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating account',
        error: error.message
      });
    }
  },

  // Update account
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const userId = req.userId;

      const account = await dbGet(
        'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }

      await dbRun(
        'UPDATE accounts SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [name, id, userId]
      );

      res.json({
        success: true,
        message: 'Account updated successfully'
      });
    } catch (error) {
      console.error('Update account error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating account',
        error: error.message
      });
    }
  },

  // Delete account
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const account = await dbGet(
        'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      // Check if there are transactions linked to this account
      const transactionCount = await dbGet(
        'SELECT COUNT(*) as count FROM transactions WHERE account_id = ?',
        [id]
      );

      if (transactionCount.count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete account with existing transactions'
        });
      }

      await dbRun(
        'DELETE FROM accounts WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      // Update user's current balance
      await dbRun(
        `UPDATE users SET current_balance = (
          SELECT COALESCE(SUM(balance), 0) FROM accounts WHERE user_id = ?
        ) WHERE id = ?`,
        [userId, userId]
      );

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting account',
        error: error.message
      });
    }
  }
};

module.exports = accountController;
