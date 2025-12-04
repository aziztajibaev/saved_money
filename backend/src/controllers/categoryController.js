const { validationResult } = require('express-validator');
const { dbRun, dbGet, dbAll } = require('../utils/dbHelpers');

const categoryController = {
  // Create category
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { name, type, icon, color } = req.body;
      const userId = req.userId;

      const result = await dbRun(
        `INSERT INTO categories (user_id, name, type, icon, color, is_default)
         VALUES (?, ?, ?, ?, ?, 0)`,
        [userId, name, type, icon || '📌', color || '#6b7280']
      );

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: {
          id: result.id,
          name,
          type,
          icon,
          color
        }
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating category',
        error: error.message
      });
    }
  },

  // Get all categories
  getAll: async (req, res) => {
    try {
      const userId = req.userId;
      const { type } = req.query;

      let sql = 'SELECT * FROM categories WHERE user_id = ?';
      const params = [userId];

      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }

      sql += ' ORDER BY name ASC';

      const categories = await dbAll(sql, params);

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error.message
      });
    }
  },

  // Update category
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const { name, icon, color } = req.body;

      const category = await dbGet(
        'SELECT * FROM categories WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const fields = [];
      const values = [];

      if (name) {
        fields.push('name = ?');
        values.push(name);
      }
      if (icon) {
        fields.push('icon = ?');
        values.push(icon);
      }
      if (color) {
        fields.push('color = ?');
        values.push(color);
      }

      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      values.push(id, userId);

      await dbRun(
        `UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      );

      res.json({
        success: true,
        message: 'Category updated successfully'
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating category',
        error: error.message
      });
    }
  },

  // Delete category
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const category = await dbGet(
        'SELECT * FROM categories WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      if (category.is_default) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete default category'
        });
      }

      await dbRun(
        'DELETE FROM categories WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting category',
        error: error.message
      });
    }
  }
};

module.exports = categoryController;
