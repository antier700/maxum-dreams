/**
 * NEXB staking domain constants and enums (source of truth for API + DB validation).
 */

/** Minimum stake amount in NEXB */
const MIN_STAKE_NEXB = 625;

/**
 * Early unstake: penalty applied to the unstaked principal only when the stake has a
 * fixed maturity date and the user unstakes strictly before that instant (UTC).
 * Flexible plans (no maturityAt) never incur this penalty.
 */
const EARLY_UNSTAKE_PENALTY_RATE = 0.05;

/** Stored on closed stake documents */
const STAKE_STATUS = {
  STAKED: 'staked',
  COMPLETED: 'completed',
  MATURED: 'matured',
  FORCE_UNSTAKED: 'force_unstaked',
};

/** API-facing open position labels (derived for list/detail; see utils/staking.js) */
const STAKE_API_OPEN = {
  LOCKED: 'locked',
  STAKED: 'staked',
  ACTIVE: 'active',
};

const CLOSED_DB_STATUSES = [
  STAKE_STATUS.COMPLETED,
  STAKE_STATUS.MATURED,
  STAKE_STATUS.FORCE_UNSTAKED,
];

module.exports = {
  MIN_STAKE_NEXB,
  EARLY_UNSTAKE_PENALTY_RATE,
  STAKE_STATUS,
  STAKE_API_OPEN,
  CLOSED_DB_STATUSES,
};
