import { Col, Row } from "react-bootstrap";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";

type Props = {
  is2FAEnabled: boolean;
  onToggle2FA: () => void;
  onChangePassword: () => void;
};

export default function SecurityTab({ is2FAEnabled, onToggle2FA, onChangePassword }: Props) {
  return (
    <div className="investor-settings__content">
      <Row className="g-3">
        <Col md={6}>
          <div className="security-card">
            <div className="security-card__icon">🛡</div>
            <div className="security-card__text">
              <h3 className="security-card__title">2-Factor Authentication</h3>
              <span className="security-card__sub">2FA</span>
            </div>
            <div className="security-card__action">
              <label className="toggle">
                <input type="checkbox" className="toggle__input" checked={is2FAEnabled} onChange={onToggle2FA} />
                <span className="toggle__slider" />
              </label>
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div className="security-card">
            <div className="security-card__icon">📄</div>
            <div className="security-card__text">
              <h3 className="security-card__title">Change Password</h3>
              <p className="security-card__desc">This password is required for login, please remember it.</p>
            </div>
            <CommonButton title="Change" className="security-card__btn" onClick={onChangePassword} />
          </div>
        </Col>
      </Row>
    </div>
  );
}
