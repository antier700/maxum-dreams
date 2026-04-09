const Plan = require('../models/Plan');

/**
 * GET /api/plans
 * Public catalog of active staking plans.
 */
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ createdAt: 1 }).lean();

    const data = plans.map((p) => ({
      id: p.planId,
      planId: p.planId,
      name: p.name,
      interestRate: p.interestRateAnnual,
      interestRateAnnual: p.interestRateAnnual,
      durationDays: p.durationDays,
      lockDurationDays: p.lockDurationDays,
      minStake: p.minStake,
    }));

    res.status(200).json({
      success: true,
      message: 'Plans fetched successfully',
      data,
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching plans',
    });
  }
};

module.exports = {
  getPlans,
};
