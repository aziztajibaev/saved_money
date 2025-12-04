const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');
const { categoryValidators } = require('../utils/validators');

router.post('/', authMiddleware, categoryValidators.create, categoryController.create);
router.get('/', authMiddleware, categoryController.getAll);
router.put('/:id', authMiddleware, categoryController.update);
router.delete('/:id', authMiddleware, categoryController.delete);

module.exports = router;
