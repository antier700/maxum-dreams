const mongoose = require('mongoose');
const { STAKE_STATUS } = require('../constants/staking');

const stakeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    /** Original principal at stake creation */
    amount: { type: Number, required: true },
    /** Remaining principal (decreases on partial unstake) */
    principalRemaining: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        STAKE_STATUS.STAKED,
        STAKE_STATUS.COMPLETED,
        STAKE_STATUS.MATURED,
        STAKE_STATUS.FORCE_UNSTAKED,
      ],
      default: STAKE_STATUS.STAKED,
    },
    createdAt: { type: Date, default: Date.now },
    maturityAt: { type: Date, default: null },
    lockUntil: { type: Date, default: null },
    /** Snapshot of plan APY at stake time */
    interestRateSnapshot: { type: Number, required: true },
    accruedReturns: { type: Number, default: 0 },
    unstakedAt: { type: Date, default: null },
  },
  { versionKey: false }
);

stakeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Stake', stakeSchema);
