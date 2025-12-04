const { validationResult } = require('express-validator');
const { dbRun, dbGet, dbAll } = require('../utils/dbHelpers');

const debtController = {
  // Create debt
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { type, personName, amount, description, dueDate } = req.body;
      const userId = req.userId;

      const result = await dbRun(
        `INSERT INTO debts (user_id, type, person_name, amount, remaining_amount, description, due_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
        [userId, type, personName, amount, amount, description || '', dueDate || null]
      );

      res.status(201).json({
        success: true,
        message: 'Debt created successfully',
        data: {
          id: result.id,
          type,
          personName,
          amount,
          remainingAmount: amount,
          description,
          dueDate,
          status: 'active'
        }
      });
    } catch (error) {
      console.error('Create debt error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating debt',
        error: error.message
      });
    }
  },

  // Get all debts
  getAll: async (req, res) => {
    try {
      const userId = req.userId;
      const { type, status } = req.query;

      let sql = `
        SELECT
          d.*,
          COALESCE(SUM(dp.amount), 0) as total_paid
        FROM debts d
        LEFT JOIN debt_payments dp ON d.id = dp.debt_id
        WHERE d.user_id = ?
      `;
      const params = [userId];

      if (type) {
        sql += ' AND d.type = ?';
        params.push(type);
      }

      if (status) {
        sql += ' AND d.status = ?';
        params.push(status);
      }

      sql += ' GROUP BY d.id ORDER BY d.created_at DESC';

      const debts = await dbAll(sql, params);

      res.json({
        success: true,
        data: debts
      });
    } catch (error) {
      console.error('Get debts error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching debts',
        error: error.message
      });
    }
  },

  // Get debt by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const debt = await dbGet(
        `SELECT
          d.*,
          COALESCE(SUM(dp.amount), 0) as total_paid
        FROM debts d
        LEFT JOIN debt_payments dp ON d.id = dp.debt_id
        WHERE d.id = ? AND d.user_id = ?
        GROUP BY d.id`,
        [id, userId]
      );

      if (!debt) {
        return res.status(404).json({
          success: false,
          message: 'Debt not found'
        });
      }

      // Get payment history
      const payments = await dbAll(
        'SELECT * FROM debt_payments WHERE debt_id = ? ORDER BY payment_date DESC',
        [id]
      );

      res.json({
        success: true,
        data: {
          ...debt,
          payments
        }
      });
    } catch (error) {
      console.error('Get debt error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching debt',
        error: error.message
      });
    }
  },

  // Add payment to debt
  addPayment: async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, paymentDate, note } = req.body;
      const userId = req.userId;

      // Get debt
      const debt = await dbGet(
        'SELECT * FROM debts WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!debt) {
        return res.status(404).json({
          success: false,
          message: 'Debt not found'
        });
      }

      if (amount > debt.remaining_amount) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount exceeds remaining debt'
        });
      }

      // Add payment
      await dbRun(
        'INSERT INTO debt_payments (debt_id, amount, payment_date, note) VALUES (?, ?, ?, ?)',
        [id, amount, paymentDate, note || '']
      );

      // Update debt
      const newRemainingAmount = debt.remaining_amount - amount;
      const newStatus = newRemainingAmount === 0 ? 'paid' : newRemainingAmount < debt.amount ? 'partial' : 'active';

      await dbRun(
        'UPDATE debts SET remaining_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newRemainingAmount, newStatus, id]
      );

      res.json({
        success: true,
        message: 'Payment added successfully',
        data: {
          remainingAmount: newRemainingAmount,
          status: newStatus
        }
      });
    } catch (error) {
      console.error('Add payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding payment',
        error: error.message
      });
    }
  },

  // Update debt
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const updates = req.body;

      const debt = await dbGet(
        'SELECT * FROM debts WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!debt) {
        return res.status(404).json({
          success: false,
          message: 'Debt not found'
        });
      }

      const fields = [];
      const values = [];

      if (updates.personName) {
        fields.push('person_name = ?');
        values.push(updates.personName);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
      }
      if (updates.dueDate !== undefined) {
        fields.push('due_date = ?');
        values.push(updates.dueDate);
      }
      if (updates.status) {
        fields.push('status = ?');
        values.push(updates.status);
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
        `UPDATE debts SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      );

      res.json({
        success: true,
        message: 'Debt updated successfully'
      });
    } catch (error) {
      console.error('Update debt error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating debt',
        error: error.message
      });
    }
  },

  // Delete debt
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const debt = await dbGet(
        'SELECT * FROM debts WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!debt) {
        return res.status(404).json({
          success: false,
          message: 'Debt not found'
        });
      }

      await dbRun(
        'DELETE FROM debts WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      res.json({
        success: true,
        message: 'Debt deleted successfully'
      });
    } catch (error) {
      console.error('Delete debt error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting debt',
        error: error.message
      });
    }
  }
};

module.exports = debtController;
