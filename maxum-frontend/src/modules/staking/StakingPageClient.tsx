"use client";

import { useMemo } from "react";
import { Container } from "react-bootstrap";
import { useAuth } from "@/contexts/AuthContext";
import { useBybitEarnListing } from "@/hooks/useBybitEarnListing";
import { BybitEarnTable } from "@/modules/staking/BybitEarnTable";
import {
  MIN_STAKE_NEXB,
} from "@/modules/staking/staking.constants";
import { StakingTopSection } from "@/modules/staking/components/StakingTopSection";
import { StakingBalanceSection } from "@/modules/staking/components/StakingBalanceSection";
import { StakingHistorySection } from "@/modules/staking/components/StakingHistorySection";
import { StakeActionModal } from "@/modules/staking/components/StakeActionModal";
import { UnstakeActionModal } from "@/modules/staking/components/UnstakeActionModal";
import { useStakingPageData } from "@/modules/staking/hooks/useStakingPageData";
import "@/modules/staking/staking.scss";

export default function StakingPageClient() {
  const { isAuthenticated, user } = useAuth();
  const listingSyncKey = useMemo(
    () => (isAuthenticated ? `auth:${user?.id ?? "user"}` : "guest"),
    [isAuthenticated, user?.id]
  );

  const { products, lastPriceByCoin, isLoading, error } = useBybitEarnListing(listingSyncKey);

  const mockDepositUiOn = process.env.NEXT_PUBLIC_MOCK_DEPOSIT_ENABLED === "true";
  const {
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
  } = useStakingPageData({ isAuthenticated, listingSyncKey });

  const stakeAmountNum = Number(stakeValues.amount);
  const stakeFormValid =
    Boolean(stakeValues.planId) &&
    Number.isFinite(stakeAmountNum) &&
    stakeAmountNum >= MIN_STAKE_NEXB &&
    stakeAmountNum <= availableBalance && stakeAgreed;

  const nexbSpot = lastPriceByCoin["NEXB"];
  const displayHistory = historyFromApi ? historyRows : demoRows;

  return (
    <Container className="investor-staking">
      <StakingTopSection
        bybitError={error}
        canStake={hasStakeableBalance}
        isAuthenticated={isAuthenticated}
        onStakeClick={openStakeModal}
        rawAvailableBalance={statsData?.availableBalance ?? statsData?.earnings ?? "0"}
      />

      {isAuthenticated && (
        <StakingBalanceSection
          mockDepositAmount={mockDepositAmount}
          mockDepositing={mockDepositing}
          mockDepositUiOn={mockDepositUiOn}
          onMockDeposit={handleMockDeposit}
          onMockDepositAmountChange={setMockDepositAmount}
          statsData={statsData}
        />
      )}

      <BybitEarnTable
        products={products}
        lastPriceByCoin={lastPriceByCoin}
        loader={isLoading}
      />

      {isAuthenticated && (
        <StakingHistorySection
          historyFromApi={historyFromApi}
          nexbSpot={nexbSpot}
          nowTick={nowTick}
          onUnstake={openUnstakeModal}
          rows={displayHistory}
        />
      )}

      <StakeActionModal
        availableBalance={availableBalance}
        isLoading={isStaking}
        isOpen={showStakingModal}
        onClose={() => setShowStakingModal(false)}
        onStake={() => void handleStake(stakeFormValid, stakeAmountNum)}
        plans={plans}
        stakeAgreed={stakeAgreed}
        stakeFormValid={stakeFormValid}
        stakeValues={stakeValues}
        statsData={statsData}
        onStakeAgreedChange={setStakeAgreed}
        onStakeValuesChange={setStakeValues}
      />

      <UnstakeActionModal
        isLoading={isUnstaking}
        isOpen={showUnstakingModal}
        row={selectedUnstakeRow}
        onClose={closeUnstakeModal}
        onConfirm={() => void handleConfirmUnstake()}
      />
    </Container>
  );
}
