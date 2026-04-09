const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/authMiddleware');
const {
  register,
  login,
  verifyLoginOtp,
  resendLoginOtp,
  forgotPassword,
  verifyOtp,
  resetPassword,
  resendVerificationEmail,
  changePassword,
  verifyEmail,
} = require('../controllers/authController');

const router = express.Router();

// Rate limiter: max 3 OTP requests per hour per IP
const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // TODO: lower back to 3 before production
  message: {
    success: false,
    message: 'Too many OTP requests from this IP. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', register);
router.post('/login', otpRateLimiter, login);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/resend-login-otp', otpRateLimiter, resendLoginOtp);
router.post('/forgot-password', otpRateLimiter, forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification-email', otpRateLimiter, resendVerificationEmail);

// Protected routes (JWT required)
router.post('/change-password', protect, changePassword);

module.exports = router;
