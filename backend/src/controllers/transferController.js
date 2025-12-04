const { validationResult } = require('express-validator');
const { dbRun, dbGet, dbAll } = require('../utils/dbHelpers');

const transferController = {
  // Create transfer
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { fromAccountId, toAccountId, amount, date, description } = req.body;
      const userId = req.userId;

      if (fromAccountId === toAccountId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot transfer to the same account'
        });
      }

      // Verify both accounts belong to user
      const fromAccount = await dbGet(
        'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
        [fromAccountId, userId]
      );

      const toAccount = await dbGet(
        'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
        [toAccountId, userId]
      );

      if (!fromAccount || !toAccount) {
        return res.status(404).json({
          success: false,
          message: 'One or both accounts not found'
        });
      }

      // Check if from account has sufficient balance
      if (fromAccount.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance in source account'
        });
      }

      // Create transfer
      const result = await dbRun(
        `INSERT INTO transfers (user_id, from_account_id, to_account_id, amount, description, date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, fromAccountId, toAccountId, amount, description || '', date]
      );

      // Update account balances
      await dbRun(
        'UPDATE accounts SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [amount, fromAccountId]
      );

      await dbRun(
        'UPDATE accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [amount, toAccountId]
      );

      res.status(201).json({
        success: true,
        message: 'Transfer completed successfully',
        data: {
          id: result.id,
          fromAccountId,
          toAccountId,
          amount,
          date,
          description
        }
      });
    } catch (error) {
      console.error('Create transfer error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating transfer',
        error: error.message
      });
    }
  },

  // Get all transfers
  getAll: async (req, res) => {
    try {
      const userId = req.userId;
      const { startDate, endDate, limit = 100, offset = 0 } = req.query;

      let sql = `
        SELECT
          t.*,
          fa.name as from_account_name,
          fa.type as from_account_type,
          ta.name as to_account_name,
          ta.type as to_account_type
        FROM transfers t
        JOIN accounts fa ON t.from_account_id = fa.id
        JOIN accounts ta ON t.to_account_id = ta.id
        WHERE t.user_id = ?
      `;
      const params = [userId];

      if (startDate) {
        sql += ' AND t.date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        sql += ' AND t.date <= ?';
        params.push(endDate);
      }

      sql += ' ORDER BY t.date DESC, t.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const transfers = await dbAll(sql, params);

      res.json({
        success: true,
        data: transfers,
        count: transfers.length
      });
    } catch (error) {
      console.error('Get transfers error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching transfers',
        error: error.message
      });
    }
  },

  // Get transfer by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const transfer = await dbGet(
        `SELECT
          t.*,
          fa.name as from_account_name,
          fa.type as from_account_type,
          ta.name as to_account_name,
          ta.type as to_account_type
        FROM transfers t
        JOIN accounts fa ON t.from_account_id = fa.id
        JOIN accounts ta ON t.to_account_id = ta.id
        WHERE t.id = ? AND t.user_id = ?`,
        [id, userId]
      );

      if (!transfer) {
        return res.status(404).json({
          success: false,
          message: 'Transfer not found'
        });
      }

      res.json({
        success: true,
        data: transfer
      });
    } catch (error) {
      console.error('Get transfer error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching transfer',
        error: error.message
      });
    }
  },

  // Delete transfer
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      // Get transfer
      const transfer = await dbGet(
        'SELECT * FROM transfers WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!transfer) {
        return res.status(404).json({
          success: false,
          message: 'Transfer not found'
        });
      }

      // Revert the transfer
      await dbRun(
        'UPDATE accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [transfer.amount, transfer.from_account_id]
      );

      await dbRun(
        'UPDATE accounts SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [transfer.amount, transfer.to_account_id]
      );

      // Delete transfer
      await dbRun(
        'DELETE FROM transfers WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      res.json({
        success: true,
        message: 'Transfer deleted successfully'
      });
    } catch (error) {
      console.error('Delete transfer error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting transfer',
        error: error.message
      });
    }
  }
};

module.exports = transferController;
