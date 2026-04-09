import { Form } from "react-bootstrap";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import CommonModal from "@/components/common/Modal/CommonModal";
import { MIN_STAKE_NEXB } from "@/modules/staking/staking.constants";
import {
  estimatePrincipalPlusInterest,
  formatPlanInterestLabel,
} from "@/lib/staking/planInterest";
import CheckboxField from "@/components/common/ui/formik/checkboxField/CheckboxField";

type StakeActionModalProps = {
  availableBalance: number;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onStake: () => void;
  plans: any[];
  stakeAgreed: boolean;
  stakeFormValid: boolean;
  stakeValues: { planId: string; amount: string };
  statsData: any;
  onStakeAgreedChange: (next: boolean) => void;
  onStakeValuesChange: (next: { planId: string; amount: string }) => void;
};

export function StakeActionModal({
  availableBalance,
  isLoading,
  isOpen,
  onClose,
  onStake,
  plans,
  stakeAgreed,
  stakeFormValid,
  stakeValues,
  statsData,
  onStakeAgreedChange,
  onStakeValuesChange,
}: StakeActionModalProps) {
  const activePlan = plans.find((plan) => plan.id === stakeValues.planId || plan._id === stakeValues.planId);
  const receiveAmount =
    activePlan && stakeValues.amount
      ? estimatePrincipalPlusInterest(
          Number(stakeValues.amount),
          activePlan.interestRate ?? activePlan.interest
        )
      : "0.00";

  return (
    <CommonModal
      show={isOpen}
      handleClose={onClose}
      heading="NEXB Staking"
      className="staking-action-modal"
    >
      <div className="staking-action-modal__info-box">
        <strong>
          {activePlan
            ? `${formatPlanInterestLabel(activePlan.interestRate ?? activePlan.interest)} interest (plan rate)`
            : "Select a plan to see interest"}
        </strong>
      </div>
      <div className="staking-action-modal__balance">
        Stakeable Balance :{" "}
        <span className="text-warning">{statsData?.availableBalance ?? statsData?.earnings ?? "0.00"} Tokens</span>
      </div>

      <Form.Group className="mb-3">
        <Form.Label className="staking-form-label">Interest</Form.Label>
        <Form.Select
          className="staking-form-select"
          value={stakeValues.planId}
          disabled={plans.length === 0}
          onChange={(event) =>
            onStakeValuesChange({
              ...stakeValues,
              planId: event.target.value,
            })
          }
        >
          <option value="">Select Staking Plan</option>
          {plans.map((plan) => (
            <option key={plan.id || plan._id} value={plan.id || plan._id}>
              {plan.name || `Plan ${plan.duration ?? plan.durationDays ?? ""}`} (
              {formatPlanInterestLabel(plan.interestRate ?? plan.interest)})
            </option>
          ))}
          {plans.length === 0 && (
            <option value="" disabled>
              No active plans available (seed plans first)
            </option>
          )}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="staking-form-label">Total Token Locked</Form.Label>
        <Form.Control
          className={`staking-form-input${
            stakeValues.amount && (Number(stakeValues.amount) < MIN_STAKE_NEXB || Number(stakeValues.amount) > availableBalance)
              ? " is-invalid"
              : ""
          }`}
          type="number"
          min={MIN_STAKE_NEXB}
          max={availableBalance || undefined}
          placeholder="Enter Token Locked"
          value={stakeValues.amount}
          onChange={(event) =>
            onStakeValuesChange({
              ...stakeValues,
              amount: event.target.value,
            })
          }
        />
        {stakeValues.amount && Number(stakeValues.amount) < MIN_STAKE_NEXB && (
          <div className="invalid-feedback d-block">
            Minimum stake is {MIN_STAKE_NEXB} NEXB
          </div>
        )}
        {stakeValues.amount && Number(stakeValues.amount) > availableBalance && (
          <div className="invalid-feedback d-block">
            Amount exceeds your available balance ({availableBalance} NEXB)
          </div>
        )}
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="staking-form-label">Token Receive</Form.Label>
        <Form.Control
          className="staking-form-input readonly-like"
          type="text"
          value={`Eg: ${receiveAmount} NEXB`}
          readOnly
        />
        <Form.Text className="text-muted small d-block mt-2">
          Read-only: estimated total NEXB at plan maturity (principal + interest %). It updates when you
          change plan or amount.
        </Form.Text>
      </Form.Group>

      <div className="staking-limits">
        <div className="staking-limits__row">
          <span>Minimum Staking</span>
          <strong>{MIN_STAKE_NEXB} NEXB</strong>
        </div>
        <div className="staking-limits__row">
          <span>Maximum Staking</span>
          <strong>{statsData?.availableBalance ?? statsData?.earnings ?? "0.00"} NEXB</strong>
        </div>
      </div>

      <Form.Group className="mb-4 d-flex align-items-center">
        <CheckboxField
          label={
            <div className="staking-checkbox-label-">
              I agree to the <span className="text-warning text-decoration-none">Terms</span> and{" "}
              <span className="text-warning text-decoration-none">Conditions of Staking Policy</span>
            </div>
          }
          name="staking-agree"
          value={stakeAgreed}
          onChange={(event) => onStakeAgreedChange(event.target.checked)}
        />
      </Form.Group>

      <CommonButton
        title="Stake Now"
        className="w-100 modal-action-btn"
        onClick={onStake}
        isLoading={isLoading}
        disabled={isLoading || !stakeFormValid}
      />
    </CommonModal>
  );
}
