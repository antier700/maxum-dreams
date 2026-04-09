const express = require('express');
const rateLimit = require('express-rate-limit');
const ipKeyGenerator = rateLimit.ipKeyGenerator;
const { optionalProtect } = require('../middleware/authMiddleware');
const { submitContact } = require('../controllers/contactController');

const router = express.Router();

const contactSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many contact submissions. Please try again in an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return `contact:user:${req.user._id.toString()}`;
    }
    const ip = req.ip || req.socket?.remoteAddress || '::1';
    return `contact:ip:${ipKeyGenerator(ip)}`;
  },
});

router.post('/', optionalProtect, contactSubmitLimiter, submitContact);

module.exports = router;
