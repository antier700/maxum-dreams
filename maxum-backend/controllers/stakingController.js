const mongoose = require('mongoose');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Stake = require('../models/Stake');
const { MIN_STAKE_NEXB, STAKE_STATUS } = require('../constants/staking');
const {
  roundMoney,
  parseAmount,
  MS_PER_DAY,
  isClosedDbStatus,
  computeEarlyUnstakePenalty,
  isLockActive,
  serializeStake,
} = require('../utils/staking');

/**
 * POST /api/user/stake
 * Body: { planId: string, amount: string|number }
 */
const stake = async (req, res) => {
  try {
    const userId = req.user._id;
    const { planId: planIdStr } = req.body;

    if (!planIdStr || typeof planIdStr !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'planId is required',
      });
    }

    let amount;
    try {
      amount = parseAmount(req.body.amount, 'amount');
    } catch (e) {
      return res.status(e.status || 400).json({ success: false, message: e.message });
    }

    const plan = await Plan.findOne({ planId: planIdStr.trim(), isActive: true });
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive plan',
      });
    }

    const minRequired = Math.max(Number(plan.minStake) || 0, MIN_STAKE_NEXB);
    if (amount < minRequired) {
      return res.status(400).json({
        success: false,
        message: `Amount must be at least ${minRequired} NEXB`,
      });
    }

    const createdAt = new Date();
    let maturityAt = null;
    if (plan.durationDays != null && plan.durationDays > 0) {
      maturityAt = new Date(createdAt.getTime() + plan.durationDays * MS_PER_DAY);
    }
    let lockUntil = null;
    if (plan.lockDurationDays > 0) {
      lockUntil = new Date(createdAt.getTime() + plan.lockDurationDays * MS_PER_DAY);
    }

    const stakePayload = {
      userId,
      planId: plan._id,
      amount,
      principalRemaining: amount,
      status: STAKE_STATUS.STAKED,
      createdAt,
      maturityAt,
      lockUntil,
      interestRateSnapshot: plan.interestRateAnnual,
      accruedReturns: 0,
    };

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, availableBalance: { $gte: amount } },
      { $inc: { availableBalance: -amount } },
      { new: true }
    );

    if (!updatedUser) {
      const u = await User.findById(userId);
      if (!u) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(400).json({
        success: false,
        message: 'Insufficient available balance',
      });
    }

    let stakeDoc;
    try {
      stakeDoc = await Stake.create(stakePayload);
    } catch (err) {
      await User.findByIdAndUpdate(userId, { $inc: { availableBalance: amount } });
      console.error('Stake create error:', err);
      return res.status(500).json({
        success: false,
        message: 'Could not create stake',
      });
    }

    await stakeDoc.populate('planId');

    const balance = roundMoney(updatedUser.availableBalance);
    res.status(201).json({
      success: true,
      data: {
        stakeId: String(stakeDoc._id),
        balance: String(balance),
        stake: serializeStake(stakeDoc, stakeDoc.planId),
      },
    });
  } catch (error) {
    console.error('Stake error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Choose closed status after a full unstake:
 * - "completed" if fixed-term and unstaked before maturity (early exit, penalty may apply)
 * - "matured" if at/after maturity, or flexible plan (no maturityAt)
 */
function closedStatusForFullUnstake(maturityAt) {
  if (!maturityAt) return STAKE_STATUS.MATURED;
  if (Date.now() < new Date(maturityAt).getTime()) return STAKE_STATUS.COMPLETED;
  return STAKE_STATUS.MATURED;
}

/**
 * POST /api/user/unstake
 * Body: { stakeId: string, amount?: string|number }
 */
const unstake = async (req, res) => {
  try {
    const userId = req.user._id;
    const { stakeId } = req.body;

    if (!stakeId || typeof stakeId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'stakeId is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(stakeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stakeId',
      });
    }

    let unstakeAmount;
    if (req.body.amount === undefined || req.body.amount === null || req.body.amount === '') {
      unstakeAmount = null;
    } else {
      try {
        unstakeAmount = parseAmount(req.body.amount, 'amount');
      } catch (e) {
        return res.status(e.status || 400).json({ success: false, message: e.message });
      }
    }

    const stakeDoc = await Stake.findOne({
      _id: stakeId,
      userId,
    }).populate('planId');

    if (!stakeDoc) {
      return res.status(404).json({
        success: false,
        message: 'Stake not found',
      });
    }

    if (isClosedDbStatus(stakeDoc.status)) {
      return res.status(400).json({
        success: false,
        message: 'Stake is already closed',
      });
    }

    if (isLockActive(stakeDoc.lockUntil)) {
      return res.status(400).json({
        success: false,
        message: 'Stake is still in the lock period; unstaking is not allowed yet',
      });
    }

    const principal = roundMoney(stakeDoc.principalRemaining);
    if (principal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No principal remaining on this stake',
      });
    }

    const portion =
      unstakeAmount == null ? principal : roundMoney(Math.min(unstakeAmount, principal));

    if (portion <= 0 || portion > principal) {
      return res.status(400).json({
        success: false,
        message: 'Invalid unstake amount',
      });
    }

    const penalty = computeEarlyUnstakePenalty(portion, stakeDoc.maturityAt);
    const netPrincipal = roundMoney(portion - penalty);
    const isFull = portion >= principal;

    let creditToAvailable = netPrincipal;
    if (isFull) {
      creditToAvailable = roundMoney(netPrincipal + roundMoney(stakeDoc.accruedReturns || 0));
    }

    stakeDoc.principalRemaining = roundMoney(principal - portion);
    if (isFull) {
      stakeDoc.status = closedStatusForFullUnstake(stakeDoc.maturityAt);
      stakeDoc.principalRemaining = 0;
      stakeDoc.unstakedAt = new Date();
      stakeDoc.accruedReturns = 0;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { availableBalance: creditToAvailable } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    try {
      await stakeDoc.save();
    } catch (saveErr) {
      await User.findByIdAndUpdate(userId, {
        $inc: { availableBalance: -creditToAvailable },
      });
      console.error('Unstake save error:', saveErr);
      return res.status(500).json({
        success: false,
        message: 'Could not finalize unstake',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        netAmount: String(creditToAvailable),
        penalty: String(penalty),
        balance: String(roundMoney(updatedUser.availableBalance)),
        principalUnstaked: String(portion),
        stakeClosed: isFull,
      },
    });
  } catch (error) {
    console.error('Unstake error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * GET /api/user/stakes
 * GET /api/user/transactions?type=stake
 */
const getStakes = async (req, res) => {
  try {
    const userId = req.user._id;

    const stakes = await Stake.find({ userId })
      .populate('planId')
      .sort({ createdAt: -1 })
      .lean();

    const items = stakes.map((s) =>
      serializeStake(
        { ...s, _id: s._id },
        s.planId
      )
    );

    res.status(200).json({
      success: true,
      data: {
        stakes: items,
        totalRecords: items.length,
      },
    });
  } catch (error) {
    console.error('Get stakes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

module.exports = {
  stake,
  unstake,
  getStakes,
};
