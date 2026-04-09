import { Col, Row } from "react-bootstrap";
import InputField from "@/components/common/ui/formik/inputField/InputField";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import { memo, useCallback } from "react";

type Props = {
  mockDepositAmount: string;
  setMockDepositAmount: (value: string) => void;
  mockDepositing: boolean;
  onMockDeposit: () => void;
};

const MockDepositSection = ({
  mockDepositAmount,
  setMockDepositAmount,
  mockDepositing,
  onMockDeposit,
}: Props) => {
  const handleThrottledClick = useCallback(() => {
    onMockDeposit();
  }, [onMockDeposit]);
  return (
    <Row className="mb-4 mb-md-5">
      <Col md={10} lg={8}>
        <div className="withdraw-section-card">
          <h2 className="investor-dashboard__section-title">Add NEXB (test balance)</h2>
          <p className="withdraw-section-card__sub mb-3">
            Credits your in-app available balance so you can stake. Uses <code>POST /api/user/mock-deposit</code> - backend
            needs <code>MOCK_DEPOSIT_ENABLED=true</code>.
          </p>
          <Row className="g-3 align-items-end">
            <Col sm={6} md={5}>
              <InputField
                label="Amount (NEXB)"
                name="mockDepositAmount"
                type="number"
                placeholder="e.g. 1000"
                value={mockDepositAmount}
                onChange={(e) => setMockDepositAmount(e.target.value)}
                className="pb-0"
              />
            </Col>
            <Col sm="auto">
              <CommonButton
                title="Credit available balance"
                onClick={handleThrottledClick}
                disabled={mockDepositing}
                // isLoading={mockDepositing}
              />
            </Col>
          </Row>
        </div>
      </Col>
    </Row>
  );
}

export default memo(MockDepositSection);