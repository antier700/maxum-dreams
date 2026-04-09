import ChangePasswordModal from "@/components/common/Modal/changePasswordModal/ChangePasswordModal";
import TwoFactorModal from "@/components/common/Modal/twoFactorModal/TwoFactorModal";
import TwoFactorOffModal from "@/components/common/Modal/twoFactorOffModal/TwoFactorOffModal";
import VerifyAuthModal from "@/components/common/Modal/verifyAuthModal/VerifyAuthModal";
import VerifyCodeModal from "@/components/common/Modal/verifyCodeModal/VerifyCodeModal";

type Props = {
  show2FAModal: boolean;
  setShow2FAModal: (v: boolean) => void;
  showVerifyAuthModal: boolean;
  setShowVerifyAuthModal: (v: boolean) => void;
  show2FAOffModal: boolean;
  setShow2FAOffModal: (v: boolean) => void;
  showChangePasswordModal: boolean;
  setShowChangePasswordModal: (v: boolean) => void;
  showVerifyCodeModal: boolean;
  setShowVerifyCodeModal: (v: boolean) => void;
  on2FAContinue: () => void;
  on2FAVerifySubmit: (code: string) => void;
  on2FATurnOff: () => void;
  onChangePasswordSubmit: (values: any) => void;
};

export default function SettingsModals(props: Props) {
  return (
    <>
      <TwoFactorModal show={props.show2FAModal} handleClose={() => props.setShow2FAModal(false)} onContinue={props.on2FAContinue} />
      <VerifyAuthModal show={props.showVerifyAuthModal} handleClose={() => props.setShowVerifyAuthModal(false)} onSubmit={props.on2FAVerifySubmit} />
      <TwoFactorOffModal show={props.show2FAOffModal} handleClose={() => props.setShow2FAOffModal(false)} onTurnOff={props.on2FATurnOff} />
      <ChangePasswordModal
        show={props.showChangePasswordModal}
        handleClose={() => props.setShowChangePasswordModal(false)}
        onSubmit={props.onChangePasswordSubmit}
      />
      <VerifyCodeModal
        show={props.showVerifyCodeModal}
        handleClose={() => props.setShowVerifyCodeModal(false)}
        onSubmit={() => props.setShowVerifyCodeModal(false)}
        onResend={() => {}}
      />
    </>
  );
}
