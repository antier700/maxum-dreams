/**
 * Seed default NEXB staking plans into MongoDB.
 * Run: node scripts/seedStakingPlans.js
 * Requires MONGO_URI (or default mongodb://localhost:27017/maxum)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('../models/Plan');

const DEFAULT_PLANS = [
  {
    planId: 'nexb-flex',
    name: 'NEXB Flexible',
    interestRateAnnual: 0.06,
    durationDays: null,
    lockDurationDays: 0,
    minStake: 625,
    isActive: true,
  },
  {
    planId: 'nexb-30d',
    name: 'NEXB 30 Day',
    interestRateAnnual: 0.1,
    durationDays: 30,
    lockDurationDays: 30,
    minStake: 625,
    isActive: true,
  },
  {
    planId: 'nexb-90d',
    name: 'NEXB 90 Day',
    interestRateAnnual: 0.14,
    durationDays: 90,
    lockDurationDays: 90,
    minStake: 625,
    isActive: true,
  },
];

async function run() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/maxum';
  await mongoose.connect(mongoUri);
  console.log('Connected:', mongoUri);

  for (const p of DEFAULT_PLANS) {
    const doc = await Plan.findOneAndUpdate(
      { planId: p.planId },
      { $set: p },
      { upsert: true, new: true }
    );
    console.log('Upserted plan:', doc.planId);
  }

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
