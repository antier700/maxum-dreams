"use client";

import CommonModal from "@/components/common/Modal/CommonModal";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import { TwoFactorShieldIcon } from "@/assets/icons/svgIcon";
import "../securityModals.scss";

interface TwoFactorOffModalProps {
    show: boolean;
    handleClose: () => void;
    onTurnOff: () => void;
}

export default function TwoFactorOffModal({
    show,
    handleClose,
    onTurnOff,
}: TwoFactorOffModalProps) {
    return (
        <CommonModal
            show={show}
            handleClose={handleClose}
            className="security-modal tfa-off-modal"
        >
            <div className="tfa-off-modal__icon-wrap">
                <TwoFactorShieldIcon />
            </div>

            <h4 className="tfa-off-modal__title">2-Factor Authentication</h4>
            <p className="tfa-off-modal__sub">
                Enabling 2FA helps keep your account safe. We strongly recommend you keep 2FA turned on.
            </p>

            <CommonButton
                title="Turn OFF 2FA"
                className="w-100 security-modal__action-btn mt-2"
                onClick={onTurnOff}
            />
        </CommonModal>
    );
}
