const { validationResult } = require('express-validator');
const { dbRun, dbGet, dbAll } = require('../utils/dbHelpers');

const transactionController = {
  // Create transaction
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { type, amount, date, accountId, categoryId, budgetId, description } = req.body;
      const userId = req.userId;

      // Verify account belongs to user
      const account = await dbGet(
        'SELECT * FROM accounts WHERE id = ? AND user_id = ?',
        [accountId, userId]
      );

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      // Create transaction
      const result = await dbRun(
        `INSERT INTO transactions (user_id, account_id, category_id, budget_id, type, amount, description, date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, accountId, categoryId || null, budgetId || null, type, amount, description || '', date]
      );

      // Update account balance
      const newBalance = type === 'income'
        ? account.balance + amount
        : account.balance - amount;

      await dbRun(
        'UPDATE accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newBalance, accountId]
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
        message: 'Transaction created successfully',
        data: {
          id: result.id,
          type,
          amount,
          date,
          accountId,
          categoryId,
          budgetId,
          description
        }
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating transaction',
        error: error.message
      });
    }
  },

  // Get all transactions
  getAll: async (req, res) => {
    try {
      const userId = req.userId;
      const { type, categoryId, accountId, startDate, endDate, limit = 100, offset = 0 } = req.query;

      let sql = `
        SELECT
          t.*,
          c.name as category_name,
          c.icon as category_icon,
          c.color as category_color,
          a.name as account_name,
          a.type as account_type
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE t.user_id = ?
      `;
      const params = [userId];

      if (type) {
        sql += ' AND t.type = ?';
        params.push(type);
      }

      if (categoryId) {
        sql += ' AND t.category_id = ?';
        params.push(categoryId);
      }

      if (accountId) {
        sql += ' AND t.account_id = ?';
        params.push(accountId);
      }

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

      const transactions = await dbAll(sql, params);

      res.json({
        success: true,
        data: transactions,
        count: transactions.length
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching transactions',
        error: error.message
      });
    }
  },

  // Get transaction by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const transaction = await dbGet(
        `SELECT
          t.*,
          c.name as category_name,
          c.icon as category_icon,
          a.name as account_name,
          a.type as account_type
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE t.id = ? AND t.user_id = ?`,
        [id, userId]
      );

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching transaction',
        error: error.message
      });
    }
  },

  // Update transaction
  update: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const userId = req.userId;
      const updates = req.body;

      // Get existing transaction
      const existingTransaction = await dbGet(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!existingTransaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Get old account
      const oldAccount = await dbGet(
        'SELECT * FROM accounts WHERE id = ?',
        [existingTransaction.account_id]
      );

      // Revert old transaction from account balance
      const revertedBalance = existingTransaction.type === 'income'
        ? oldAccount.balance - existingTransaction.amount
        : oldAccount.balance + existingTransaction.amount;

      await dbRun(
        'UPDATE accounts SET balance = ? WHERE id = ?',
        [revertedBalance, oldAccount.id]
      );

      // Build update query
      const fields = [];
      const values = [];

      if (updates.type) {
        fields.push('type = ?');
        values.push(updates.type);
      }
      if (updates.amount !== undefined) {
        fields.push('amount = ?');
        values.push(updates.amount);
      }
      if (updates.date) {
        fields.push('date = ?');
        values.push(updates.date);
      }
      if (updates.accountId) {
        fields.push('account_id = ?');
        values.push(updates.accountId);
      }
      if (updates.categoryId !== undefined) {
        fields.push('category_id = ?');
        values.push(updates.categoryId);
      }
      if (updates.budgetId !== undefined) {
        fields.push('budget_id = ?');
        values.push(updates.budgetId);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id, userId);

      await dbRun(
        `UPDATE transactions SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      );

      // Get updated transaction
      const updatedTransaction = await dbGet(
        'SELECT * FROM transactions WHERE id = ?',
        [id]
      );

      // Apply new transaction to account balance
      const accountId = updates.accountId || existingTransaction.account_id;
      const account = await dbGet('SELECT * FROM accounts WHERE id = ?', [accountId]);

      const newBalance = updatedTransaction.type === 'income'
        ? account.balance + updatedTransaction.amount
        : account.balance - updatedTransaction.amount;

      await dbRun(
        'UPDATE accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newBalance, accountId]
      );

      // Update user's current balance
      await dbRun(
        `UPDATE users SET current_balance = (
          SELECT SUM(balance) FROM accounts WHERE user_id = ?
        ) WHERE id = ?`,
        [userId, userId]
      );

      res.json({
        success: true,
        message: 'Transaction updated successfully',
        data: updatedTransaction
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating transaction',
        error: error.message
      });
    }
  },

  // Delete transaction
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      // Get transaction
      const transaction = await dbGet(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Get account
      const account = await dbGet(
        'SELECT * FROM accounts WHERE id = ?',
        [transaction.account_id]
      );

      // Revert transaction from account balance
      const newBalance = transaction.type === 'income'
        ? account.balance - transaction.amount
        : account.balance + transaction.amount;

      await dbRun(
        'UPDATE accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newBalance, account.id]
      );

      // Delete transaction
      await dbRun(
        'DELETE FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      // Update user's current balance
      await dbRun(
        `UPDATE users SET current_balance = (
          SELECT SUM(balance) FROM accounts WHERE user_id = ?
        ) WHERE id = ?`,
        [userId, userId]
      );

      res.json({
        success: true,
        message: 'Transaction deleted successfully'
      });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting transaction',
        error: error.message
      });
    }
  }
};

module.exports = transactionController;
