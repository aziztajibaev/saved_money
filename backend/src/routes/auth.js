const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { authValidators } = require('../utils/validators');

router.post('/register', authValidators.register, authController.register);
router.post('/login', authValidators.login, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
