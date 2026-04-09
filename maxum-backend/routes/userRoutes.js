const express = require('express');
const {
  getProfile,
  updateProfile,
  getTransactions,
  getReferralRewards,
  mockDeposit,
  withdrawTokens,
  generate2FA,
  verify2FA,
  changePassword,
} = require('../controllers/userController');
const { stake, unstake, getStakes } = require('../controllers/stakingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All user routes are protected
router.get('/profile', protect, getProfile);
router.put('/update', protect, updateProfile);
router.get('/transactions', protect, getTransactions);
router.get('/referrals/rewards', protect, getReferralRewards);
router.post('/mock-deposit', protect, mockDeposit);
router.post('/withdraw', protect, withdrawTokens);
router.post('/stake', protect, stake);
router.post('/unstake', protect, unstake);
router.get('/stakes', protect, getStakes);

// 2FA Routes
router.get('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA);

// Security Routes
router.post('/auth/change-password', protect, changePassword);

module.exports = router;
