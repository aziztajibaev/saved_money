const { body, param, query } = require('express-validator');

const authValidators = {
  register: [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('initialBalance').optional().isFloat({ min: 0 }).withMessage('Initial balance must be a positive number')
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
  ]
};

const transactionValidators = {
  create: [
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('accountId').isInt().withMessage('Account ID is required'),
    body('categoryId').optional().isInt(),
    body('budgetId').optional().isInt(),
    body('description').optional().trim()
  ],
  update: [
    param('id').isInt().withMessage('Invalid transaction ID'),
    body('type').optional().isIn(['income', 'expense']),
    body('amount').optional().isFloat({ gt: 0 }),
    body('date').optional().isISO8601(),
    body('accountId').optional().isInt(),
    body('categoryId').optional().isInt(),
    body('budgetId').optional().isInt(),
    body('description').optional().trim()
  ]
};

const categoryValidators = {
  create: [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('icon').optional().trim(),
    body('color').optional().trim()
  ]
};

const budgetValidators = {
  create: [
    body('name').trim().notEmpty().withMessage('Budget name is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('period').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
    body('startDate').isISO8601().withMessage('Invalid start date'),
    body('endDate').optional().isISO8601(),
    body('categoryId').optional().isInt(),
    body('alertThreshold').optional().isFloat({ min: 0, max: 100 })
  ]
};

const debtValidators = {
  create: [
    body('type').isIn(['debt', 'loan']).withMessage('Type must be debt or loan'),
    body('personName').trim().notEmpty().withMessage('Person name is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('dueDate').optional().isISO8601(),
    body('description').optional().trim()
  ]
};

const transferValidators = {
  create: [
    body('fromAccountId').isInt().withMessage('From account ID is required'),
    body('toAccountId').isInt().withMessage('To account ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('description').optional().trim()
  ]
};

module.exports = {
  authValidators,
  transactionValidators,
  categoryValidators,
  budgetValidators,
  debtValidators,
  transferValidators
};
