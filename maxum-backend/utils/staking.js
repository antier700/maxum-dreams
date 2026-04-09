const {
  EARLY_UNSTAKE_PENALTY_RATE,
  STAKE_API_OPEN,
  CLOSED_DB_STATUSES,
} = require('../constants/staking');

const MS_PER_DAY = 86400000;

function roundMoney(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 1e8) / 1e8;
}

/**
 * Parse body amount to a positive finite number.
 */
function parseAmount(value, fieldName = 'amount') {
  const n = typeof value === 'string' ? parseFloat(value.trim()) : Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    const err = new Error(`Invalid ${fieldName}: must be a positive number`);
    err.status = 400;
    throw err;
  }
  return roundMoney(n);
}

function isClosedDbStatus(status) {
  return CLOSED_DB_STATUSES.includes(status);
}

/**
 * True when maturity is defined and current time is strictly before maturity (early exit rules apply).
 */
function isBeforeMaturity(maturityAt) {
  if (!maturityAt) return false;
  return Date.now() < new Date(maturityAt).getTime();
}

/**
 * Penalty = 5% of unstaked principal only if stake has maturityAt and now < maturityAt.
 * Flexible plans (no maturityAt) never incur this penalty.
 */
function computeEarlyUnstakePenalty(principalPortion, maturityAt) {
  if (!isBeforeMaturity(maturityAt)) return 0;
  return roundMoney(principalPortion * EARLY_UNSTAKE_PENALTY_RATE);
}

function isLockActive(lockUntil) {
  if (!lockUntil) return false;
  return Date.now() < new Date(lockUntil).getTime();
}

/**
 * API status for list/detail (open positions):
 * - locked: lock window active (cannot unstake)
 * - staked: unlocked but before maturity (early unstake penalty applies)
 * - active: unlocked and at/after maturity, or flexible plan (no penalty)
 * Closed: completed | matured | force_unstaked
 */
function apiStatusForStake(stake) {
  if (isClosedDbStatus(stake.status)) return stake.status;
  if (isLockActive(stake.lockUntil)) return STAKE_API_OPEN.LOCKED;
  if (isBeforeMaturity(stake.maturityAt)) return STAKE_API_OPEN.STAKED;
  return STAKE_API_OPEN.ACTIVE;
}

/**
 * User may unstake only when principal remains and lock has ended (if any).
 */
function computeCanUnstake(stake) {
  if (isClosedDbStatus(stake.status)) return false;
  if (!stake.principalRemaining || stake.principalRemaining <= 0) return false;
  if (isLockActive(stake.lockUntil)) return false;
  return true;
}

function serializePlan(plan) {
  if (!plan) return null;
  const p = plan.toObject ? plan.toObject() : plan;
  return {
    id: p.planId,
    name: p.name,
    interestRate: p.interestRateAnnual,
    durationDays: p.durationDays,
    lockDurationDays: p.lockDurationDays,
  };
}

function serializeStake(stakeDoc, planDoc) {
  const s = stakeDoc.toObject ? stakeDoc.toObject() : { ...stakeDoc };
  const plan = planDoc || s.planId;
  const planObj = plan && typeof plan === 'object' && plan.name ? serializePlan(plan) : null;

  const status = apiStatusForStake(s);
  const canUnstake = computeCanUnstake(s);

  return {
    id: String(s._id),
    _id: String(s._id),
    amount: String(roundMoney(s.amount)),
    stakedAmount: String(roundMoney(s.principalRemaining)),
    principalRemaining: roundMoney(s.principalRemaining),
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
    maturityAt: s.maturityAt ? new Date(s.maturityAt).toISOString() : null,
    lockUntil: s.lockUntil ? new Date(s.lockUntil).toISOString() : null,
    planName: planObj ? planObj.name : undefined,
    plan: planObj,
    status,
    accruedReturns: String(roundMoney(s.accruedReturns || 0)),
    returns: roundMoney(s.accruedReturns || 0),
    canUnstake,
    interestRateSnapshot: s.interestRateSnapshot,
    unstakedAt: s.unstakedAt ? new Date(s.unstakedAt).toISOString() : null,
  };
}

module.exports = {
  roundMoney,
  parseAmount,
  MS_PER_DAY,
  isClosedDbStatus,
  isBeforeMaturity,
  computeEarlyUnstakePenalty,
  isLockActive,
  apiStatusForStake,
  computeCanUnstake,
  serializeStake,
  serializePlan,
};
