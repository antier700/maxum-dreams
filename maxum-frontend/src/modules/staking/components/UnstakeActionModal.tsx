import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import CommonModal from "@/components/common/Modal/CommonModal";
import { WarningIcon } from "@/assets/icons/svgIcon";
import {
  unstakePenaltyTokens,
  type StakeHistoryRow,
} from "@/modules/staking/stakingHistory.utils";

type UnstakeActionModalProps = {
  isLoading: boolean;
  isOpen: boolean;
  row: StakeHistoryRow | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function UnstakeActionModal({
  isLoading,
  isOpen,
  row,
  onClose,
  onConfirm,
}: UnstakeActionModalProps) {
  const stakedAmount = row ? Number.parseFloat(row.amount) : 0;
  const penaltyApplies = !!row?.earlyUnstakePenaltyApplies;
  const penaltyTokens = Number.isFinite(stakedAmount)
    ? unstakePenaltyTokens(stakedAmount, penaltyApplies)
    : "0";
  const penaltyNum = Number(penaltyTokens) || 0;
  const netReceivable =
    Number.isFinite(stakedAmount) && stakedAmount > 0
      ? (Math.round((stakedAmount - penaltyNum) * 1e8) / 1e8).toString()
      : "0";

  return (
    <CommonModal
      show={isOpen}
      handleClose={onClose}
      heading="NEXB Unstaking"
      className="staking-action-modal"
    >
      {/* Warning banner */}
      <div className={`unstaking-warning-box${penaltyApplies ? " unstaking-warning-box--alert" : ""}`}>
        <WarningIcon />
        <span>
          {penaltyApplies
            ? "⚠ Early unstake — a 5% penalty will be deducted from your staked principal."
            : "No early-unstake penalty for this position (matured or flexible plan)."}
        </span>
      </div>

      {/* Details grid */}
      <div className="unstaking-details">
        <div className="unstaking-details__row">
          <span>Staked Tokens</span>
          <strong>{row ? `${row.amount} NEXB` : "—"}</strong>
        </div>

        <div className={`unstaking-details__row${penaltyApplies ? " unstaking-details__row--penalty" : ""}`}>
          <span>Penalty Tokens {penaltyApplies ? "(5%)" : ""}</span>
          <strong className={penaltyApplies ? "text-danger" : ""}>
            {penaltyApplies ? `− ${penaltyTokens} NEXB` : "0 NEXB"}
          </strong>
        </div>

        <div className="unstaking-details__row unstaking-details__row--net">
          <span>You Will Receive</span>
          <strong className="text-green">{netReceivable} NEXB</strong>
        </div>

        {row?.maturity && row.maturity !== "—" && (
          <div className="unstaking-details__row">
            <span>Maturity Date</span>
            <strong>{row.maturity}</strong>
          </div>
        )}
      </div>

      <CommonButton
        title="Confirm Unstake"
        className="w-100 modal-action-btn mt-4"
        onClick={onConfirm}
        isLoading={isLoading}
        disabled={isLoading || !row}
      />
    </CommonModal>
  );
}
