import { formatPlanInterestLabel } from "@/lib/staking/planInterest";

export type StakeHistoryRow = {
  id?: string;
  /** Shown in table & unstake modal — prefer remaining principal when API sends it */
  amount: string;
  date: string;
  maturity: string;
  plan: string;
  returns: string;
  returnsClass?: string;
  action: string;
  actionClass?: string;
  unstakeable?: boolean;
  /** NEXB API: early penalty only when derived status is `staked` (before maturity, after lock). */
  earlyUnstakePenaltyApplies?: boolean;
  startMs?: number;
  endMs?: number;
  maturityReturn?: number;
};

const UNSTAKE_PENALTY = 0.05;

export function formatStakeDate(isoOrMs: string | number | undefined): string {
  if (isoOrMs === undefined || isoOrMs === "") return "—";
  const d = typeof isoOrMs === "number" ? new Date(isoOrMs) : new Date(isoOrMs);
  if (Number.isNaN(d.getTime())) return String(isoOrMs);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function liveAccruedReturns(row: StakeHistoryRow, nowMs: number): string {
  if (
    row.startMs != null &&
    row.endMs != null &&
    row.maturityReturn != null &&
    row.endMs > row.startMs
  ) {
    const t = Math.max(0, Math.min(1, (nowMs - row.startMs) / (row.endMs - row.startMs)));
    return (row.maturityReturn * t).toFixed(2);
  }
  return row.returns;
}

export function unstakePenaltyTokens(stakedAmount: number, earlyPenaltyApplies = true): string {
  if (!earlyPenaltyApplies) return "0";
  if (!Number.isFinite(stakedAmount) || stakedAmount <= 0) return "0";
  return (Math.round(stakedAmount * UNSTAKE_PENALTY * 1e8) / 1e8).toString();
}

const TERMINAL_STAKE_STATUSES = new Set([
  "completed",
  "complete",
  "closed",
  "redeemed",
  "matured",
  "force_unstaked",
  "forceunstaked",
  "cancelled",
  "canceled",
  "failed",
  "withdrawn",
  "settled",
]);

function normalizeStakeStatus(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function formatActionLabel(statusRaw: unknown, terminal: boolean): string {
  if (terminal) {
    const s = String(statusRaw ?? "completed").replace(/_/g, " ");
    return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : "Completed";
  }
  const s = String(statusRaw ?? "—").trim();
  return s.length ? s : "—";
}

/**
 * NEXB backend sends `canUnstake` — trust it when present.
 * `locked` = lockUntil in future → backend sets canUnstake false (never treat locked as unstakeable).
 */
export function deriveStakeUnstakeable(tx: any): boolean {
  if (!tx || typeof tx !== "object") return false;

  const statusRaw =
    tx.stakeStatus ?? tx.status ?? tx.state ?? tx.stakingStatus ?? tx.stake?.status;
  const norm = normalizeStakeStatus(statusRaw);

  if (TERMINAL_STAKE_STATUSES.has(norm)) return false;

  if (tx.canUnstake === false) return false;

  if (tx.canUnstake === true) {
    const pr = Number(tx.principalRemaining);
    if (Number.isFinite(pr) && pr <= 0) return false;
    return true;
  }

  if (norm === "locked") return false;

  const activeLike = new Set([
    "active",
    "staking",
    "staked",
    "open",
    "in_progress",
    "inprogress",
    "ongoing",
    "running",
    "pending",
  ]);
  return activeLike.has(norm);
}

export function mapTransactionToStakeRow(tx: any, index: number): StakeHistoryRow | null {
  if (!tx || typeof tx !== "object") return null;
  const id = tx._id ?? tx.id ?? tx.stakeId ?? tx.stakingId;

  const principalRemaining = tx.principalRemaining;
  const hasRemaining = principalRemaining !== undefined && principalRemaining !== null;
  const amountSource =
    hasRemaining ? principalRemaining : tx.amount ?? tx.stakedAmount ?? tx.stakeAmount ?? tx.principal;

  if (amountSource === undefined || amountSource === null) return null;

  const statusRaw = tx.stakeStatus ?? tx.status ?? tx.state ?? tx.stakingStatus;
  const norm = normalizeStakeStatus(statusRaw);
  const terminal = TERMINAL_STAKE_STATUSES.has(norm);
  const unstakeable = deriveStakeUnstakeable(tx);

  const rateForLabel =
    tx.interestRateSnapshot ?? tx.plan?.interestRate ?? tx.plan?.interest ?? tx.interestRate;

  const planLabel =
    tx.planName ??
    tx.plan?.name ??
    (tx.planId != null && !tx.plan?.name ? `Plan ${tx.planId}` : null) ??
    (rateForLabel != null ? `NEXB (${formatPlanInterestLabel(rateForLabel)})` : null) ??
    tx.plan ??
    "—";

  const earlyUnstakePenaltyApplies = unstakeable && norm === "staked";

  // Map start/end timestamps so liveAccruedReturns() can interpolate real-time returns
  const rawCreatedAt = tx.createdAt ?? tx.stakedAt ?? tx.date;
  const rawMaturityAt = tx.maturityAt ?? tx.maturityDate ?? tx.unlockAt ?? tx.maturesAt;
  const startMs = rawCreatedAt ? new Date(rawCreatedAt).getTime() : undefined;
  const endMs = rawMaturityAt ? new Date(rawMaturityAt).getTime() : undefined;

  // Estimate maturity return: principal × interestRate (annualised over plan duration)
  const principal = Number(amountSource) || 0;
  const rate = Number(
    tx.interestRateSnapshot ?? tx.plan?.interestRate ?? tx.plan?.interest ?? tx.interestRate ?? 0
  );
  let maturityReturn: number | undefined;
  if (principal > 0 && rate > 0 && startMs && endMs && endMs > startMs) {
    const durationYears = (endMs - startMs) / (365.25 * 86400000);
    maturityReturn = Math.round(principal * (rate / 100) * durationYears * 1e8) / 1e8;
  }

  return {
    id: id != null ? String(id) : `tx-${index}`,
    amount: String(amountSource),
    date: formatStakeDate(rawCreatedAt),
    maturity: formatStakeDate(rawMaturityAt),
    plan: planLabel === "" || planLabel == null ? "—" : String(planLabel),
    returns: String(tx.accruedReturns ?? tx.returns ?? tx.reward ?? tx.accrued ?? "0"),
    returnsClass: "text-green",
    action: unstakeable ? "Unstake" : formatActionLabel(statusRaw, terminal),
    actionClass:
      norm === "force_unstaked" || norm === "forceunstaked" ? "text-warning" : undefined,
    unstakeable,
    earlyUnstakePenaltyApplies,
    startMs: Number.isFinite(startMs) ? startMs : undefined,
    endMs: Number.isFinite(endMs) ? endMs : undefined,
    maturityReturn,
  };
}

/**
 * Normalize stake list from various backend envelopes, e.g.:
 * { data: { stakes: [] } }, { stakes: [] }, { data: [] }, { success, result: { stakes } } }
 */
export function extractStakesList(payload: any): any[] {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== "object") return [];

  const tryArray = (v: unknown): any[] | null => (Array.isArray(v) ? v : null);

  const direct =
    tryArray(payload.stakes) ||
    tryArray(payload.transactions) ||
    tryArray(payload.data);
  if (direct) return direct;

  const inner = payload.data;
  if (inner && typeof inner === "object") {
    const fromInner =
      tryArray(inner.stakes) ||
      tryArray(inner.transactions) ||
      tryArray(inner.data) ||
      tryArray(inner.results);
    if (fromInner) return fromInner;
  }

  const result = payload.result;
  if (result && typeof result === "object") {
    const fromResult = tryArray(result.stakes) || tryArray(result.transactions) || tryArray(result.data);
    if (fromResult) return fromResult;
  }

  return [];
}
