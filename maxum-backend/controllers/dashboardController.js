const User = require('../models/User');
const Stake = require('../models/Stake');
const { STAKE_STATUS } = require('../constants/staking');
const { roundMoney } = require('../utils/staking');

/**
 * GET /api/dashboard/stats
 * Authenticated user: balances + open staking positions for dashboard / stake modal.
 */
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const openStakes = await Stake.find({
      userId,
      status: STAKE_STATUS.STAKED,
    }).lean();

    const totalStakedPrincipal = openStakes.reduce(
      (sum, s) => sum + (Number(s.principalRemaining) || 0),
      0
    );

    res.status(200).json({
      success: true,
      message: 'Dashboard stats fetched successfully',
      data: {
        availableBalance: String(roundMoney(user.availableBalance || 0)),
        rewardBalance: String(roundMoney(user.rewardBalance || 0)),
        activeStakes: openStakes.length,
        totalStakedPrincipal: String(roundMoney(totalStakedPrincipal)),
        twoFaEnabled: Boolean(user.twoFactorEnabled),
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching dashboard stats',
    });
  }
};

module.exports = {
  getDashboardStats,
};
