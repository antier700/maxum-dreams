"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { dashboardService } from "@/services/dashboard.service";
import { plansService } from "@/services/plans.service";
import { transactionService } from "@/services/transaction.service";
import {
  extractStakesList,
  mapTransactionToStakeRow,
  type StakeHistoryRow,
} from "@/modules/staking/stakingHistory.utils";
import {
  HISTORY_POLL_MS,
  MIN_STAKE_NEXB,
  RETURNS_TICK_MS,
} from "@/modules/staking/staking.constants";

type UseStakingPageDataArgs = {
  isAuthenticated: boolean;
  listingSyncKey: string;
};

function useDemoHistoryRows(): StakeHistoryRow[] {
  return useMemo(() => {
    const now = Date.now();
    return [
      {
        id: "demo-1",
        amount: "5000",
        date: new Date(now - 2 * 86400000).toLocaleString(),
        maturity: new Date(now + 5 * 86400000).toLocaleString(),
        plan: "C (21%)",
        returns: "1050",
        returnsClass: "text-green",
        action: "Unstake",
        unstakeable: true,
        earlyUnstakePenaltyApplies: true,
        startMs: now - 2 * 86400000,
        endMs: now + 5 * 86400000,
        maturityReturn: 1050,
      },
      {
        id: "demo-2",
        amount: "3000",
        date: new Date(now - 86400000).toLocaleString(),
        maturity: new Date(now + 4 * 86400000).toLocaleString(),
        plan: "B (15%)",
        returns: "150",
        returnsClass: "text-green",
        action: "Force Unstaked",
        actionClass: "red-text",
      },
    ];
  }, []);
}

export function useStakingPageData({ isAuthenticated, listingSyncKey }: UseStakingPageDataArgs) {
  const demoRows = useDemoHistoryRows();

  const [showStakingModal, setShowStakingModal] = useState(false);
  const [showUnstakingModal, setShowUnstakingModal] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [historyRows, setHistoryRows] = useState<StakeHistoryRow[]>([]);
  const [historyFromApi, setHistoryFromApi] = useState(false);
  const [stakeValues, setStakeValues] = useState({ planId: "", amount: "" });
  const [stakeAgreed, setStakeAgreed] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [selectedUnstakeRow, setSelectedUnstakeRow] = useState<StakeHistoryRow | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [mockDepositAmount, setMockDepositAmount] = useState("5000");
  const [mockDepositing, setMockDepositing] = useState(false);

  const availableBalance = Number(statsData?.availableBalance ?? statsData?.earnings ?? 0);
  const hasStakeableBalance =
    Number.isFinite(availableBalance) && availableBalance >= MIN_STAKE_NEXB;

  const fetchDashboardAndPlans = useCallback(async () => {
    try {
      const [statsRes, plansRes] = await Promise.all([
        dashboardService.getStats(),
        plansService.getPlans(),
      ]);
      setStatsData(statsRes.data?.data || statsRes.data);
      setPlans(plansRes.data?.data?.plans || plansRes.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch staking data", error);
      toast.error("Could not load balance or plans. Check API URL and login.");
    }
  }, []);

  const fetchStakeHistory = useCallback(async () => {
    try {
      let list: any[] = [];

      try {
        const response = await transactionService.getStakes();
        list = extractStakesList(response.data);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[staking] GET /user/stakes failed, trying transactions", error);
        }
      }

      if (list.length === 0) {
        try {
          const response = await transactionService.getTransactions({ type: "stake" });
          const fallback = extractStakesList(response.data);
          if (fallback.length > 0) list = fallback;
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[staking] GET /user/transactions?type=stake failed", error);
          }
        }
      }

      const mappedRows = list
        .map((tx: any, index: number) => mapTransactionToStakeRow(tx, index))
        .filter(Boolean) as StakeHistoryRow[];

      setHistoryRows(mappedRows);
      setHistoryFromApi(true);
    } catch {
      // Only fall back to demo rows if unauthenticated; authenticated users see empty state
      if (!isAuthenticated) {
        setHistoryRows(demoRows);
      } else {
        setHistoryRows([]);
      }
      setHistoryFromApi(false);
    }
  }, [demoRows, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setStatsData(null);
      setPlans([]);
      setHistoryRows([]);
      setHistoryFromApi(false);
      return;
    }

    void fetchDashboardAndPlans();
    void fetchStakeHistory();
  }, [isAuthenticated, listingSyncKey, fetchDashboardAndPlans, fetchStakeHistory]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const intervalId = window.setInterval(() => void fetchStakeHistory(), HISTORY_POLL_MS);
    return () => window.clearInterval(intervalId);
  }, [isAuthenticated, fetchStakeHistory]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const intervalId = window.setInterval(() => setNowTick(Date.now()), RETURNS_TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [isAuthenticated]);

  useEffect(() => {
    if (showStakingModal) return;
    setStakeValues({ planId: "", amount: "" });
    setStakeAgreed(false);
  }, [showStakingModal]);

  const refreshAll = useCallback(async () => {
    await fetchDashboardAndPlans();
    await fetchStakeHistory();
  }, [fetchDashboardAndPlans, fetchStakeHistory]);

  const openStakeModal = useCallback(() => {
    if (!isAuthenticated) return;
    if (!hasStakeableBalance) {
      toast.error(
        `You need at least ${MIN_STAKE_NEXB} NEXB in available balance to stake. Deposit from Dashboard first.`
      );
      return;
    }
    setShowStakingModal(true);
  }, [hasStakeableBalance, isAuthenticated]);

  const openUnstakeModal = useCallback((row: StakeHistoryRow) => {
    if (!row.unstakeable) return;
    setSelectedUnstakeRow(row);
    setShowUnstakingModal(true);
  }, []);

  const closeUnstakeModal = useCallback(() => {
    setShowUnstakingModal(false);
    setSelectedUnstakeRow(null);
  }, []);

  const handleMockDeposit = useCallback(async () => {
    const amount = Number(mockDepositAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid NEXB amount.");
      return;
    }

    setMockDepositing(true);
    try {
      const response = await transactionService.mockDeposit({ amount });
      const statsResponse = await dashboardService.getStats();
      setStatsData(statsResponse.data?.data || statsResponse.data);
      toast.success(response.data?.message || "Balance updated.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Mock deposit failed. Set MOCK_DEPOSIT_ENABLED=true in backend .env and restart."
      );
    } finally {
      setMockDepositing(false);
    }
  }, [mockDepositAmount]);

  const handleStake = useCallback(
    async (stakeFormValid: boolean, stakeAmountNum: number) => {
      if (!stakeFormValid) {
        if (!stakeAgreed) toast.error("Please accept the staking terms.");
        else if (stakeAmountNum < MIN_STAKE_NEXB)
          toast.error(`Minimum stake is ${MIN_STAKE_NEXB} NEXB.`);
        else if (stakeAmountNum > availableBalance)
          toast.error("Amount exceeds your stakeable balance.");
        else toast.error("Please select a plan and enter a valid amount.");
        return false;
      }

      setIsStaking(true);
      try {
        await transactionService.stakeTokens({
          amount: stakeValues.amount,
          planId: stakeValues.planId,
        });
        toast.success("Tokens staked successfully.");
        setShowStakingModal(false);
        await refreshAll();
        return true;
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to stake tokens.");
        return false;
      } finally {
        setIsStaking(false);
      }
    },
    [availableBalance, refreshAll, stakeAgreed, stakeValues.amount, stakeValues.planId]
  );

  const handleConfirmUnstake = useCallback(async () => {
    if (!selectedUnstakeRow) return false;

    setIsUnstaking(true);
    try {
      await transactionService.unstakeTokens({ stakeId: selectedUnstakeRow.id });
      toast.success("Unstake request submitted.");
      closeUnstakeModal();
      await refreshAll();
      return true;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Unstake failed — ensure POST /user/unstake exists (with API prefix if used)."
      );
      return false;
    } finally {
      setIsUnstaking(false);
    }
  }, [closeUnstakeModal, refreshAll, selectedUnstakeRow]);

  return {
    availableBalance,
    hasStakeableBalance,
    historyFromApi,
    historyRows,
    isStaking,
    isUnstaking,
    mockDepositAmount,
    mockDepositing,
    nowTick,
    plans,
    selectedUnstakeRow,
    showStakingModal,
    showUnstakingModal,
    stakeAgreed,
    stakeValues,
    statsData,
    demoRows,
    closeUnstakeModal,
    handleConfirmUnstake,
    handleMockDeposit,
    handleStake,
    openStakeModal,
    openUnstakeModal,
    setMockDepositAmount,
    setShowStakingModal,
    setStakeAgreed,
    setStakeValues,
  };
}
