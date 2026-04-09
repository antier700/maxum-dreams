"use client";

import { useState } from "react";
import { Container } from "react-bootstrap";
import "@/app/(private)/dashboard/dashboard.scss";
import WithdrawModal from "@/components/common/Modal/withdrawModal/WithdrawModal";
import { transactionService } from "@/services/transaction.service";
import toast from "react-hot-toast";
import BalanceCardsSection from "./components/BalanceCardsSection";
import MockDepositSection from "./components/MockDepositSection";
import StakeTokenSection from "./components/StakeTokenSection";
import WithdrawSection from "./components/WithdrawSection";
import TransactionHistorySection from "./components/TransactionHistorySection";
import RewardHistorySection from "./components/RewardHistorySection";
import { useDashboardRealtime } from "./hooks/useDashboardRealtime";

const CONTRACT_ADDRESS = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

export default function DashboardPage() {
  const { txTab, setTxTab, statsData, setStatsData, transactions, rewards, refreshStats, refreshAll } = useDashboardRealtime();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [mockDepositAmount, setMockDepositAmount] = useState("1000");
  const [mockDepositing, setMockDepositing] = useState(false);
  const mockDepositUiOn = process.env.NEXT_PUBLIC_MOCK_DEPOSIT_ENABLED === "true";

  const handleCopyContract = async (e?: any) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      toast.success("Contract Address copied to clipboard!");
    } catch (err) {
      console.error("Clipboard error:", err);
      toast.error("Clipboard write is not allowed by your browser.");
    }
  };

  const handleImportToken = async () => {
    if (typeof (window as any).ethereum !== "undefined") {
      try {
        await (window as any).ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: CONTRACT_ADDRESS,
              symbol: "NEXB",
              decimals: 18,
              image: "https://yourwebsite.com/logo.png",
            },
          },
        });
        toast.success("Token added to your wallet!");
      } catch (error) {
        toast.error("Failed to add token. Please try manually.", { id: 'add_token'});
      }
    } else {
      toast.error("Web3 wallet (like MetaMask) not detected!");
    }
  };

  const handleWithdraw = async (values: { amount: string; walletAddress: string }) => {
    const amount = values.amount.trim();
    const walletAddress = values.walletAddress.trim();
    if (!amount || Number(amount) <= 0 || !walletAddress) {
      toast.error("Please provide valid amount and wallet address");
      return;
    }
    setIsWithdrawing(true);
    try {
      await transactionService.withdrawTokens({
        amount,
        walletAddress,
        token: "NEXB",
      });
      // Switch to withdraw tab and refresh all data so the new tx is visible immediately
      setTxTab("withdraw");
      await refreshAll();
      toast.success("Withdrawal request submitted successfully.");
      setShowWithdrawModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to withdraw tokens");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleMockDeposit = async () => {
    const n = Number(mockDepositAmount);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Enter a valid NEXB amount.");
      return;
    }
    setMockDepositing(true);
    try {
      const res = await transactionService.mockDeposit({ amount: n });
      await refreshStats();
      toast.success(res.data?.message || "Balance updated.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not credit balance.");
    } finally {
      setMockDepositing(false);
    }
  };

  const handleStake = async () => {
    setIsStaking(true);
    try {
      await transactionService.stakeTokens({ amount: "5000" }); // Using dummy payload for testing
      toast.success("Tokens staked successfully.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to stake tokens");
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="investor-dashboard">
      <Container>
        <h1 className="investor-dashboard__title">Investor Dashboard</h1>
        <BalanceCardsSection statsData={statsData} />
        {mockDepositUiOn && (
          <MockDepositSection
            mockDepositAmount={mockDepositAmount}
            setMockDepositAmount={setMockDepositAmount}
            mockDepositing={mockDepositing}
            onMockDeposit={handleMockDeposit}
          />
        )}
        <StakeTokenSection
          contractAddress={CONTRACT_ADDRESS}
          isStaking={isStaking}
          onStake={handleStake}
          onCopyContract={handleCopyContract}
        />
        <WithdrawSection
          contractAddress={CONTRACT_ADDRESS}
          onCopyContract={handleCopyContract}
          onImportToken={handleImportToken}
          onOpenWithdraw={() => setShowWithdrawModal(true)}
        />
        <TransactionHistorySection txTab={txTab} onChangeTab={setTxTab} rows={transactions} />
        <RewardHistorySection txTab={txTab} rows={rewards} />

        <WithdrawModal
          show={showWithdrawModal}
          handleClose={() => setShowWithdrawModal(false)}
          walletBalance={statsData?.availableBalance ?? statsData?.earnings ?? "0.00"}
          onWithdraw={handleWithdraw}
          isLoading={isWithdrawing}
        />
      </Container>
    </div>
  );
}
