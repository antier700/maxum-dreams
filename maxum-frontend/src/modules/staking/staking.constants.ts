export const MIN_STAKE_NEXB = 625;
export const HISTORY_POLL_MS = 30_000;
export const RETURNS_TICK_MS = 5_000;

export const HISTORY_FIELDS = [
  { label: "Staked Amount", key: "amount" },
  { label: "Date", key: "date" },
  { label: "Maturity", key: "maturity" },
  { label: "Plan", key: "plan" },
  { label: "Staked Returns", key: "returns" },
  { label: "Action", key: "action" },
];

export const STAKING_TERMS = [
  "The minimum number of tokens required to stake is 625 NEXB.",
  "Staking is available across three distinct periods.",
  "Users are allowed to stake tokens partially.",
  "Unstaking mid-way will include a 5% deduction of the unstaked amount.",
];
