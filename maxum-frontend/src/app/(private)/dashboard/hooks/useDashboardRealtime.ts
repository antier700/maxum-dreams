"use client";

import { useCallback, useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard.service";
import { transactionService } from "@/services/transaction.service";
import toast from "react-hot-toast";

const REALTIME_REFRESH_MS = 15000;

/**
 * One effect + one interval batches stats + history requests so the dashboard
 * does not fire duplicate parallel loads on mount (and pairs with reactStrictMode off in dev).
 *
 * txTab drives which transaction type is shown:
 *  - "deposit"  → GET /user/transactions?type=deposit
 *  - "withdraw" → GET /user/transactions?type=withdraw
 */
export function useDashboardRealtime() {
  const [txTab, setTxTab] = useState<"deposit" | "withdraw">("deposit");
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);

  const fetchAll = useCallback(
    async (silent: boolean) => {
      try {
        const [statsRes, txRes, rewardRes] = await Promise.all([
          dashboardService.getStats(),
          transactionService.getTransactions({ type: txTab }),
          transactionService.getReferralRewards({}),
        ]);
        setStatsData(statsRes.data?.data || statsRes.data);
        const txList =
          txRes.data?.data?.transactions ||
          txRes.data?.transactions ||
          txRes.data?.data ||
          [];
        setTransactions(Array.isArray(txList) ? txList : []);
        const rewardList =
          rewardRes.data?.data?.rewards ||
          rewardRes.data?.rewards ||
          rewardRes.data?.data ||
          [];
        setRewards(Array.isArray(rewardList) ? rewardList : []);
      } catch (error: any) {
        if (!silent) {
          console.error("Failed to fetch dashboard data", error);
          toast.error("Could not load dashboard data.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [txTab]
  );

  useEffect(() => {
    let ignore = false;

    const run = async (silent: boolean) => {
      if (ignore) return;
      await fetchAll(silent);
    };

    void run(false);
    const intervalId = window.setInterval(() => void run(true), REALTIME_REFRESH_MS);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [fetchAll]);

  const refreshStats = async () => {
    const statsRes = await dashboardService.getStats();
    setStatsData(statsRes.data?.data || statsRes.data);
  };

  /** Call after a withdraw action so the history tab refreshes immediately */
  const refreshAll = useCallback(() => fetchAll(true), [fetchAll]);

  return {
    txTab,
    setTxTab,
    statsData,
    setStatsData,
    isLoading,
    transactions,
    rewards,
    refreshStats,
    refreshAll,
  };
}
