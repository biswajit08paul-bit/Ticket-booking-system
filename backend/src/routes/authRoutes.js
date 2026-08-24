const express = require('express');
const router = express.Router();
const { AuthController } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { 
  validateRequest, 
  registerValidation, 
  loginValidation 
} = require('../middleware/validation');

router.post('/register', registerValidation, validateRequest, AuthController.register);
router.post('/login', loginValidation, validateRequest, AuthController.login);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/resend-otp', AuthController.resendOTP);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/me', protect, AuthController.getCurrentUser);

module.exports = router;