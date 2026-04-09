import { Col, Row } from "react-bootstrap";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import InputField from "@/components/common/ui/formik/inputField/InputField";
import { STAKING_TERMS } from "@/modules/staking/staking.constants";

type StakingBalanceSectionProps = {
  mockDepositAmount: string;
  mockDepositing: boolean;
  mockDepositUiOn: boolean;
  onMockDeposit: () => void;
  onMockDepositAmountChange: (next: string) => void;
  statsData: any;
};

export function StakingBalanceSection({
  mockDepositAmount,
  mockDepositing,
  mockDepositUiOn,
  onMockDeposit,
  onMockDepositAmountChange,
  statsData,
}: StakingBalanceSectionProps) {
  return (
    <div className="investor-staking__balanceCard mb-4">
      <Row className="g-3">
        <Col md={6} className="d-flex">
          <div className="staking-balance-card w-100">
            <div className="staking-balance-card__row">
              <span className="staking-balance-card__label">Available Balance</span>
              <span className="staking-balance-card__value">
                {statsData?.availableBalance ?? statsData?.earnings ?? "0.00"} NEXB
              </span>
            </div>
            <div className="staking-balance-card__row">
              <span className="staking-balance-card__label">Reward Balance</span>
              <span className="staking-balance-card__value">{statsData?.rewardBalance ?? "0.00"} NEXB</span>
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div className="staking-terms-card">
            <h3 className="staking-terms-card__title">Terms and Conditions</h3>
            <ul className="staking-terms-card__list">
              {STAKING_TERMS.map((term) => (
                <li key={term}>
                  <span className="staking-terms-card__bullet">»</span>
                  {term}
                </li>
              ))}
            </ul>
          </div>
        </Col>
      </Row>

      {mockDepositUiOn && (
        <Row className="g-3 mt-2">
          <Col xs={12}>
            <div className="staking-mock-deposit p-3 rounded border border-secondary border-opacity-25">
              <p className="small text-muted mb-2">
                <strong>Test credit</strong> — adds NEXB to your available balance (no blockchain). Backend:{" "}
                <code>MOCK_DEPOSIT_ENABLED=true</code>. Not for production.
              </p>
              <div className="d-flex flex-wrap gap-2 align-items-end">
                <InputField
                  label="Amount (NEXB)"
                  name="stakingMockDeposit"
                  type="number"
                  placeholder="5000"
                  value={mockDepositAmount}
                  onChange={(event) => onMockDepositAmountChange(event.target.value)}
                />
                <CommonButton
                  title="Credit balance"
                  onClick={onMockDeposit}
                  disabled={mockDepositing}
                  isLoading={mockDepositing}
                />
              </div>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
}
