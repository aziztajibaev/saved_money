const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

router.get('/dashboard', authMiddleware, analyticsController.getDashboard);
router.get('/trends', authMiddleware, analyticsController.getTrends);
router.get('/category-breakdown', authMiddleware, analyticsController.getCategoryBreakdown);
router.get('/monthly-report', authMiddleware, analyticsController.getMonthlyReport);

module.exports = router;
