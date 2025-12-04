const { validationResult } = require('express-validator');
const { dbRun, dbGet, dbAll } = require('../utils/dbHelpers');

const budgetController = {
  // Create budget
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { name, amount, period, startDate, endDate, categoryId, alertThreshold } = req.body;
      const userId = req.userId;

      const result = await dbRun(
        `INSERT INTO budgets (user_id, category_id, name, amount, period, start_date, end_date, alert_threshold)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, categoryId || null, name, amount, period, startDate, endDate || null, alertThreshold || 80]
      );

      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: {
          id: result.id,
          name,
          amount,
          period,
          startDate,
          endDate,
          categoryId,
          alertThreshold
        }
      });
    } catch (error) {
      console.error('Create budget error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating budget',
        error: error.message
      });
    }
  },

  // Get all budgets
  getAll: async (req, res) => {
    try {
      const userId = req.userId;
      const { period, categoryId } = req.query;

      let sql = `
        SELECT
          b.*,
          c.name as category_name,
          c.icon as category_icon,
          c.color as category_color,
          COALESCE(SUM(t.amount), 0) as spent
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN transactions t ON t.budget_id = b.id AND t.type = 'expense'
          AND t.date >= b.start_date
          AND (b.end_date IS NULL OR t.date <= b.end_date)
        WHERE b.user_id = ?
      `;
      const params = [userId];

      if (period) {
        sql += ' AND b.period = ?';
        params.push(period);
      }

      if (categoryId) {
        sql += ' AND b.category_id = ?';
        params.push(categoryId);
      }

      sql += ' GROUP BY b.id ORDER BY b.created_at DESC';

      const budgets = await dbAll(sql, params);

      // Calculate percentage and status for each budget
      const budgetsWithStatus = budgets.map(budget => ({
        ...budget,
        percentage: (budget.spent / budget.amount) * 100,
        remaining: budget.amount - budget.spent,
        isOverBudget: budget.spent > budget.amount,
        isNearLimit: (budget.spent / budget.amount) * 100 >= budget.alert_threshold
      }));

      res.json({
        success: true,
        data: budgetsWithStatus
      });
    } catch (error) {
      console.error('Get budgets error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching budgets',
        error: error.message
      });
    }
  },

  // Get budget by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const budget = await dbGet(
        `SELECT
          b.*,
          c.name as category_name,
          c.icon as category_icon,
          COALESCE(SUM(t.amount), 0) as spent
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN transactions t ON t.budget_id = b.id AND t.type = 'expense'
          AND t.date >= b.start_date
          AND (b.end_date IS NULL OR t.date <= b.end_date)
        WHERE b.id = ? AND b.user_id = ?
        GROUP BY b.id`,
        [id, userId]
      );

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found'
        });
      }

      budget.percentage = (budget.spent / budget.amount) * 100;
      budget.remaining = budget.amount - budget.spent;
      budget.isOverBudget = budget.spent > budget.amount;
      budget.isNearLimit = budget.percentage >= budget.alert_threshold;

      res.json({
        success: true,
        data: budget
      });
    } catch (error) {
      console.error('Get budget error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching budget',
        error: error.message
      });
    }
  },

  // Update budget
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const updates = req.body;

      const budget = await dbGet(
        'SELECT * FROM budgets WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found'
        });
      }

      const fields = [];
      const values = [];

      if (updates.name) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.amount !== undefined) {
        fields.push('amount = ?');
        values.push(updates.amount);
      }
      if (updates.period) {
        fields.push('period = ?');
        values.push(updates.period);
      }
      if (updates.startDate) {
        fields.push('start_date = ?');
        values.push(updates.startDate);
      }
      if (updates.endDate !== undefined) {
        fields.push('end_date = ?');
        values.push(updates.endDate);
      }
      if (updates.categoryId !== undefined) {
        fields.push('category_id = ?');
        values.push(updates.categoryId);
      }
      if (updates.alertThreshold !== undefined) {
        fields.push('alert_threshold = ?');
        values.push(updates.alertThreshold);
      }

      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id, userId);

      await dbRun(
        `UPDATE budgets SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      );

      res.json({
        success: true,
        message: 'Budget updated successfully'
      });
    } catch (error) {
      console.error('Update budget error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating budget',
        error: error.message
      });
    }
  },

  // Delete budget
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const budget = await dbGet(
        'SELECT * FROM budgets WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found'
        });
      }

      await dbRun(
        'DELETE FROM budgets WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      res.json({
        success: true,
        message: 'Budget deleted successfully'
      });
    } catch (error) {
      console.error('Delete budget error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting budget',
        error: error.message
      });
    }
  }
};

module.exports = budgetController;
