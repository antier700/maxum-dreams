import http from "./axiosInstance";
import { TRANSACTION_URLS } from "@/constants/urls";

export const transactionService = {
  /** Preferred: NEXB staking list (`data.stakes`). */
  getStakes: () => http.get(TRANSACTION_URLS.STAKES),
  getTransactions: (params?: any) => http.get(TRANSACTION_URLS.HISTORY, { params }),
  getReferralRewards: (params?: any) => http.get(TRANSACTION_URLS.REFERRALS_REWARDS, { params }),
  /** Dev/demo: credits MongoDB availableBalance when backend MOCK_DEPOSIT_ENABLED=true */
  mockDeposit: (payload: { amount: string | number }) =>
    http.post(TRANSACTION_URLS.MOCK_DEPOSIT, payload),
  withdrawTokens: (payload: { amount: string | number; walletAddress: string; token: string }) =>
    http.post(TRANSACTION_URLS.WITHDRAW, payload),
  stakeTokens: (payload: { amount: string | number; planId?: string }) =>
    http.post(TRANSACTION_URLS.STAKE, payload),
  unstakeTokens: (payload: { stakeId?: string; amount?: string | number }) =>
    http.post(TRANSACTION_URLS.UNSTAKE, payload),
};
