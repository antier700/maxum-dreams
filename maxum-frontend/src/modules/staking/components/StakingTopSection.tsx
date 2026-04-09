import Link from "next/link";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import { MIN_STAKE_NEXB } from "@/modules/staking/staking.constants";

type StakingTopSectionProps = {
  bybitError?: string | null;
  canStake: boolean;
  isAuthenticated: boolean;
  onStakeClick: () => void;
  rawAvailableBalance: string | number;
};

export function StakingTopSection({
  bybitError,
  canStake,
  isAuthenticated,
  onStakeClick,
  rawAvailableBalance,
}: StakingTopSectionProps) {
  return (
    <>
      <div className="investor-staking__head">
        <h1 className="investor-staking__title">Stake NEXB, Earn NEXB</h1>
        <CommonButton title="Stake Token" onClick={onStakeClick} disabled={!isAuthenticated || !canStake} />
      </div>

      {isAuthenticated && !canStake && (
        <p className="investor-staking__balance-hint text-muted small mb-3">
          Staking needs at least <strong>{MIN_STAKE_NEXB} NEXB</strong> available balance. Yours is{" "}
          <strong>{rawAvailableBalance} NEXB</strong>. Add funds from the{" "}
          <Link href="/dashboard" className="text-warning text-decoration-underline">
            Dashboard
          </Link>{" "}
          (deposit) first, or use test credit below if enabled.
        </p>
      )}

      {!isAuthenticated && (
        <div className="investor-staking__guest-banner">
          <p>
            You can browse Bybit earn products below without an account. Log in to stake NEXB on our
            platform and manage your history.
          </p>
          <CommonButton title="Log in" role="link" to="/login" />
        </div>
      )}

      {bybitError && (
        <p className="text-warning small mb-3" role="alert">
          Could not load Bybit listing: {bybitError}
        </p>
      )}
    </>
  );
}
