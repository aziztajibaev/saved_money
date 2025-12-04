const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/auth');
const { budgetValidators } = require('../utils/validators');

router.post('/', authMiddleware, budgetValidators.create, budgetController.create);
router.get('/', authMiddleware, budgetController.getAll);
router.get('/:id', authMiddleware, budgetController.getById);
router.put('/:id', authMiddleware, budgetController.update);
router.delete('/:id', authMiddleware, budgetController.delete);

module.exports = router;
