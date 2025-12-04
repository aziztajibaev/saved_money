const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const authMiddleware = require('../middleware/auth');
const { transferValidators } = require('../utils/validators');

router.post('/', authMiddleware, transferValidators.create, transferController.create);
router.get('/', authMiddleware, transferController.getAll);
router.get('/:id', authMiddleware, transferController.getById);
router.delete('/:id', authMiddleware, transferController.delete);

module.exports = router;
