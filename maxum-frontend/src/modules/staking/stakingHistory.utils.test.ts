import {
  formatStakeDate,
  unstakePenaltyTokens,
  liveAccruedReturns,
  mapTransactionToStakeRow,
} from "./stakingHistory.utils";

describe("formatStakeDate", () => {
  it("returns em dash for empty input", () => {
    expect(formatStakeDate(undefined)).toBe("—");
    expect(formatStakeDate("")).toBe("—");
  });

  it("formats valid ISO date", () => {
    const out = formatStakeDate("2024-06-01T14:30:00.000Z");
    expect(out).not.toBe("—");
    expect(out).toMatch(/2024/);
  });
});

describe("unstakePenaltyTokens", () => {
  it("returns 0 when early penalty does not apply", () => {
    expect(unstakePenaltyTokens(1000, false)).toBe("0");
  });

  it("returns 5% rounded when penalty applies", () => {
    expect(unstakePenaltyTokens(100, true)).toBe("5");
    expect(unstakePenaltyTokens(0, true)).toBe("0");
  });
});

describe("liveAccruedReturns", () => {
  it("interpolates between start and end", () => {
    const row = {
      amount: "100",
      date: "",
      maturity: "",
      plan: "",
      returns: "0",
      action: "",
      startMs: 0,
      endMs: 1000,
      maturityReturn: 100,
    };
    expect(liveAccruedReturns(row, 500)).toBe("50.00");
  });

  it("falls back to row.returns when range missing", () => {
    const row = {
      amount: "1",
      date: "",
      maturity: "",
      plan: "",
      returns: "12.34",
      action: "",
    };
    expect(liveAccruedReturns(row, Date.now())).toBe("12.34");
  });
});

describe("mapTransactionToStakeRow – startMs / endMs / maturityReturn", () => {
  const baseStake = {
    _id: "abc123",
    amount: 1000,
    principalRemaining: 1000,
    status: "staked",
    canUnstake: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    maturityAt: "2025-07-01T00:00:00.000Z",
    interestRateSnapshot: 12,
    accruedReturns: 30,
  };

  it("populates startMs and endMs from backend ISO dates", () => {
    const row = mapTransactionToStakeRow(baseStake, 0);
    expect(row).not.toBeNull();
    expect(row!.startMs).toBe(new Date("2025-01-01T00:00:00.000Z").getTime());
    expect(row!.endMs).toBe(new Date("2025-07-01T00:00:00.000Z").getTime());
  });

  it("calculates maturityReturn from principal × rate × duration", () => {
    const row = mapTransactionToStakeRow(baseStake, 0);
    expect(row).not.toBeNull();
    // 6-month stake at 12% APY: 1000 × 0.12 × ~0.5yr ≈ 60
    expect(Number(row!.maturityReturn)).toBeGreaterThan(50);
    expect(Number(row!.maturityReturn)).toBeLessThan(70);
  });

  it("sets earlyUnstakePenaltyApplies true for an active staked row", () => {
    const row = mapTransactionToStakeRow(baseStake, 0);
    expect(row?.earlyUnstakePenaltyApplies).toBe(true);
  });

  it("returns null for null/undefined input", () => {
    expect(mapTransactionToStakeRow(null, 0)).toBeNull();
    expect(mapTransactionToStakeRow(undefined, 0)).toBeNull();
  });
});
