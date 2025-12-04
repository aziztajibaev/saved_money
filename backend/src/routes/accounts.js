const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, accountController.getAll);
router.post('/', authMiddleware, accountController.create);
router.put('/:id', authMiddleware, accountController.update);
router.delete('/:id', authMiddleware, accountController.delete);

module.exports = router;
