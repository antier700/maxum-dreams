const mongoose = require('mongoose');

/**
 * Staking plan catalog. planId is the string clients send (e.g. nexb-flex).
 */
const planSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    /** Annual interest rate as decimal, e.g. 0.08 for 8% APY */
    interestRateAnnual: { type: Number, required: true },
    /** Fixed term length in days; null/undefined = flexible (no maturity) */
    durationDays: { type: Number, default: null },
    /** Days from stake start during which unstake is blocked entirely */
    lockDurationDays: { type: Number, default: 0 },
    minStake: { type: Number, default: 625 },
    isActive: { type: Boolean, default: true },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
