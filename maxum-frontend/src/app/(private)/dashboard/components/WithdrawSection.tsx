import { Col, Row } from "react-bootstrap";
import { CopyIcon } from "@/assets/icons/svgIcon";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import InputField from "@/components/common/ui/formik/inputField/InputField";

type Props = {
  contractAddress: string;
  onCopyContract: (e?: any) => void;
  onImportToken: () => void;
  onOpenWithdraw: () => void;
};

export default function WithdrawSection({ contractAddress, onCopyContract, onImportToken, onOpenWithdraw }: Props) {
  return (
    <section className="investor-dashboard__withdraw mb-4 mb-md-5">
      <h2 className="investor-dashboard__section-title">Withdraw your Token</h2>
      <div className="withdraw-section-card">
        <p className="withdraw-section-card__heading">Follow these Instructions</p>
        <p className="withdraw-section-card__sub">
          Use an <strong>ERC-20 compatible wallet</strong> (e.g. MetaMask) on the <strong>same network as NEXB</strong>. In the next step you will paste the <strong>public receive address (0x…)</strong> where tokens should be sent after the platform processes your withdrawal.
        </p>
        <Row className="g-3">
          <Col md={6}>
            <div className="withdraw-card">
              <h3 className="withdraw-card__title">1st add the NEXB Token Contract to your wallet under &quot;Import Tokens&quot;</h3>
              <div className="withdraw-card__input-wrap">
                <InputField
                  label="Contract Address"
                  name="contractAddress"
                  value={contractAddress}
                  readOnly
                  righttext={
                    <span style={{ cursor: "pointer" }}>
                      <CopyIcon />
                    </span>
                  }
                  righttextOnclick={onCopyContract}
                />
              </div>
              <CommonButton title="Click Here to Import Token" className="withdraw-card__btn" onClick={onImportToken} />
              <p className="withdraw-card__note">
                Import only adds NEXB to your wallet list so you can see it. <strong>MetaMask may show balance 0</strong> until tokens actually arrive on-chain. If MetaMask warns about a duplicate symbol, check the contract address matches this site before confirming.
              </p>
            </div>
          </Col>
          <Col md={6}>
            <div className="withdraw-card">
              <h3 className="withdraw-card__title">2nd your wallet address where you want your NEXB Token Deposited</h3>
              <p className="withdraw-card__note withdraw-card__note--mb">
                Click below, then enter amount and your receive address in the modal. Use <strong>Use MetaMask address</strong> there to fill your current wallet, or paste any valid 0x address you control.
              </p>
              <CommonButton title="Withdraw NEXB" fluid className="withdraw-card__btn" onClick={onOpenWithdraw} />
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
