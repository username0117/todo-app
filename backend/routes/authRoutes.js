const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter, registerLimiter, protect } = require('../middleware/authMiddleware');

// 인증이 필요하지 않은 라우트
router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);

// 인증이 필요한 라우트
router.get('/me', protect, authController.getMe);

module.exports = router;