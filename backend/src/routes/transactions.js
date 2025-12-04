const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');
const { transactionValidators } = require('../utils/validators');

router.post('/', authMiddleware, transactionValidators.create, transactionController.create);
router.get('/', authMiddleware, transactionController.getAll);
router.get('/:id', authMiddleware, transactionController.getById);
router.put('/:id', authMiddleware, transactionValidators.update, transactionController.update);
router.delete('/:id', authMiddleware, transactionController.delete);

module.exports = router;
