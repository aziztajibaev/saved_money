const express = require('express');
const router = express.Router();
const debtController = require('../controllers/debtController');
const authMiddleware = require('../middleware/auth');
const { debtValidators } = require('../utils/validators');

router.post('/', authMiddleware, debtValidators.create, debtController.create);
router.get('/', authMiddleware, debtController.getAll);
router.get('/:id', authMiddleware, debtController.getById);
router.post('/:id/payments', authMiddleware, debtController.addPayment);
router.put('/:id', authMiddleware, debtController.update);
router.delete('/:id', authMiddleware, debtController.delete);

module.exports = router;
