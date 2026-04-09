/**
 * NEXB backend may send `interestRate` as a decimal fraction (e.g. 0.1 = 10% of principal
 * for the plan period) or legacy percent points (e.g. 10).
 */
export function interestRateToFraction(rate: unknown): number {
  const r = Number(rate);
  if (!Number.isFinite(r) || r < 0) return 0;
  if (r <= 1) return r;
  return r / 100;
}

export function formatPlanInterestLabel(rate: unknown): string {
  return `${(interestRateToFraction(rate) * 100).toFixed(2)}%`;
}

export function estimatePrincipalPlusInterest(principal: number, rate: unknown): string {
  const f = interestRateToFraction(rate);
  if (!Number.isFinite(principal) || principal <= 0) return "0.00";
  return (principal * (1 + f)).toFixed(2);
}
