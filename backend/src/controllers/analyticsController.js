const { dbGet, dbAll } = require('../utils/dbHelpers');

const analyticsController = {
  // Get dashboard summary
  getDashboard: async (req, res) => {
    try {
      const userId = req.userId;
      const { startDate, endDate } = req.query;

      // Get current balance
      const user = await dbGet(
        'SELECT current_balance, initial_balance FROM users WHERE id = ?',
        [userId]
      );

      // Get total income and expenses
      let sql = `
        SELECT
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions
        WHERE user_id = ?
      `;
      const params = [userId];

      if (startDate) {
        sql += ' AND date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        sql += ' AND date <= ?';
        params.push(endDate);
      }

      const totals = await dbGet(sql, params);

      // Get income/expense by category
      let categorySql = `
        SELECT
          c.name,
          c.icon,
          c.color,
          c.type,
          SUM(t.amount) as total
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ?
      `;
      const categoryParams = [userId];

      if (startDate) {
        categorySql += ' AND t.date >= ?';
        categoryParams.push(startDate);
      }

      if (endDate) {
        categorySql += ' AND t.date <= ?';
        categoryParams.push(endDate);
      }

      categorySql += ' GROUP BY c.id, c.name, c.icon, c.color, c.type ORDER BY total DESC';

      const categoryData = await dbAll(categorySql, categoryParams);

      // Get account balances
      const accounts = await dbAll(
        'SELECT id, name, type, balance FROM accounts WHERE user_id = ?',
        [userId]
      );

      // Get active budgets with spent amount
      const budgets = await dbAll(
        `SELECT
          b.id,
          b.name,
          b.amount,
          b.alert_threshold,
          COALESCE(SUM(t.amount), 0) as spent
        FROM budgets b
        LEFT JOIN transactions t ON t.budget_id = b.id AND t.type = 'expense'
          AND t.date >= b.start_date
          AND (b.end_date IS NULL OR t.date <= b.end_date)
        WHERE b.user_id = ?
          AND (b.end_date IS NULL OR b.end_date >= date('now'))
        GROUP BY b.id
        ORDER BY (COALESCE(SUM(t.amount), 0) / b.amount) DESC`,
        [userId]
      );

      const budgetsWithStatus = budgets.map(budget => ({
        ...budget,
        percentage: (budget.spent / budget.amount) * 100,
        remaining: budget.amount - budget.spent,
        isOverBudget: budget.spent > budget.amount,
        isNearLimit: (budget.spent / budget.amount) * 100 >= budget.alert_threshold
      }));

      // Get recent transactions
      const recentTransactions = await dbAll(
        `SELECT
          t.*,
          c.name as category_name,
          c.icon as category_icon,
          c.color as category_color,
          a.name as account_name
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN accounts a ON t.account_id = a.id
        WHERE t.user_id = ?
        ORDER BY t.date DESC, t.created_at DESC
        LIMIT 10`,
        [userId]
      );

      // Get active debts summary
      const debts = await dbGet(
        `SELECT
          SUM(CASE WHEN type = 'debt' THEN remaining_amount ELSE 0 END) as total_debts,
          SUM(CASE WHEN type = 'loan' THEN remaining_amount ELSE 0 END) as total_loans
        FROM debts
        WHERE user_id = ? AND status != 'paid'`,
        [userId]
      );

      res.json({
        success: true,
        data: {
          currentBalance: user.current_balance,
          initialBalance: user.initial_balance,
          totalIncome: totals.total_income || 0,
          totalExpense: totals.total_expense || 0,
          netSavings: (totals.total_income || 0) - (totals.total_expense || 0),
          categoryData,
          accounts,
          budgets: budgetsWithStatus,
          recentTransactions,
          debts: {
            totalDebts: debts.total_debts || 0,
            totalLoans: debts.total_loans || 0
          }
        }
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard data',
        error: error.message
      });
    }
  },

  // Get income/expense trends over time
  getTrends: async (req, res) => {
    try {
      const userId = req.userId;
      const { startDate, endDate, groupBy = 'day' } = req.query;

      let dateFormat;
      switch (groupBy) {
        case 'month':
          dateFormat = '%Y-%m';
          break;
        case 'year':
          dateFormat = '%Y';
          break;
        default:
          dateFormat = '%Y-%m-%d';
      }

      let sql = `
        SELECT
          strftime('${dateFormat}', date) as period,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions
        WHERE user_id = ?
      `;
      const params = [userId];

      if (startDate) {
        sql += ' AND date >= ?';
        params.push(startDate);
      }

      if (endDate) {
        sql += ' AND date <= ?';
        params.push(endDate);
      }

      sql += ' GROUP BY period ORDER BY period ASC';

      const trends = await dbAll(sql, params);

      const trendsWithSavings = trends.map(item => ({
        ...item,
        savings: item.income - item.expense
      }));

      res.json({
        success: true,
        data: trendsWithSavings
      });
    } catch (error) {
      console.error('Get trends error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching trends',
        error: error.message
      });
    }
  },

  // Get category breakdown
  getCategoryBreakdown: async (req, res) => {
    try {
      const userId = req.userId;
      const { type, startDate, endDate } = req.query;

      let sql = `
        SELECT
          c.id,
          c.name,
          c.icon,
          c.color,
          c.type,
          SUM(t.amount) as total,
          COUNT(t.id) as transaction_count
        FROM categories c
        LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = ?
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

      sql += ' WHERE c.user_id = ?';
      params.push(userId);

      if (type) {
        sql += ' AND c.type = ?';
        params.push(type);
      }

      sql += ' GROUP BY c.id ORDER BY total DESC';

      const breakdown = await dbAll(sql, params);

      // Calculate total for percentage
      const total = breakdown.reduce((sum, item) => sum + (item.total || 0), 0);

      const breakdownWithPercentage = breakdown.map(item => ({
        ...item,
        percentage: total > 0 ? (item.total / total) * 100 : 0
      }));

      res.json({
        success: true,
        data: {
          categories: breakdownWithPercentage,
          total
        }
      });
    } catch (error) {
      console.error('Get category breakdown error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching category breakdown',
        error: error.message
      });
    }
  },

  // Get monthly report
  getMonthlyReport: async (req, res) => {
    try {
      const userId = req.userId;
      const { year, month } = req.query;

      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-31`;

      // Get totals
      const totals = await dbGet(
        `SELECT
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions
        WHERE user_id = ? AND date >= ? AND date <= ?`,
        [userId, startDate, endDate]
      );

      // Get category breakdown
      const categories = await dbAll(
        `SELECT
          c.name,
          c.icon,
          c.color,
          c.type,
          SUM(t.amount) as total,
          COUNT(t.id) as count
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ? AND t.date >= ? AND t.date <= ?
        GROUP BY c.id
        ORDER BY total DESC`,
        [userId, startDate, endDate]
      );

      // Get daily breakdown
      const dailyData = await dbAll(
        `SELECT
          date,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions
        WHERE user_id = ? AND date >= ? AND date <= ?
        GROUP BY date
        ORDER BY date ASC`,
        [userId, startDate, endDate]
      );

      res.json({
        success: true,
        data: {
          period: `${year}-${month}`,
          totalIncome: totals.total_income || 0,
          totalExpense: totals.total_expense || 0,
          netSavings: (totals.total_income || 0) - (totals.total_expense || 0),
          categories,
          dailyData
        }
      });
    } catch (error) {
      console.error('Get monthly report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching monthly report',
        error: error.message
      });
    }
  }
};

module.exports = analyticsController;
