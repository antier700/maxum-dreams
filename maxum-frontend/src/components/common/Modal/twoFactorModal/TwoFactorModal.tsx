"use client";

import CommonModal from "@/components/common/Modal/CommonModal";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import { CopyIcon } from "@/assets/icons/svgIcon";
import "../securityModals.scss";

import { useState, useEffect } from "react";
import { userService } from "@/services/user.service";
import toast from "react-hot-toast";

interface TwoFactorModalProps {
    show: boolean;
    handleClose: () => void;
    onContinue: () => void;
}

const QRPlaceholder = () => (
    <svg
        viewBox="0 0 200 200"
        className="tfa-modal__qr"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect width="200" height="200" fill="#fff" />
        {/* Top-left finder pattern */}
        <rect x="10" y="10" width="60" height="60" rx="4" fill="#000" />
        <rect x="20" y="20" width="40" height="40" rx="2" fill="#fff" />
        <rect x="28" y="28" width="24" height="24" rx="1" fill="#000" />
        {/* Top-right finder pattern */}
        <rect x="130" y="10" width="60" height="60" rx="4" fill="#000" />
        <rect x="140" y="20" width="40" height="40" rx="2" fill="#fff" />
        <rect x="148" y="28" width="24" height="24" rx="1" fill="#000" />
        {/* Bottom-left finder pattern */}
        <rect x="10" y="130" width="60" height="60" rx="4" fill="#000" />
        <rect x="20" y="140" width="40" height="40" rx="2" fill="#fff" />
        <rect x="28" y="148" width="24" height="24" rx="1" fill="#000" />
        {/* Data modules (simplified pattern) */}
        <rect x="80" y="10" width="8" height="8" fill="#000" />
        <rect x="96" y="10" width="8" height="8" fill="#000" />
        <rect x="112" y="10" width="8" height="8" fill="#000" />
        <rect x="80" y="26" width="8" height="8" fill="#000" />
        <rect x="96" y="18" width="8" height="8" fill="#000" />
        <rect x="112" y="26" width="8" height="8" fill="#000" />
        <rect x="80" y="42" width="8" height="8" fill="#000" />
        <rect x="96" y="34" width="8" height="8" fill="#000" />
        <rect x="80" y="58" width="8" height="8" fill="#000" />
        <rect x="96" y="50" width="8" height="8" fill="#000" />
        <rect x="112" y="42" width="8" height="8" fill="#000" />
        <rect x="10" y="80" width="8" height="8" fill="#000" />
        <rect x="26" y="80" width="8" height="8" fill="#000" />
        <rect x="42" y="88" width="8" height="8" fill="#000" />
        <rect x="58" y="80" width="8" height="8" fill="#000" />
        <rect x="74" y="80" width="8" height="8" fill="#000" />
        <rect x="90" y="80" width="8" height="8" fill="#000" />
        <rect x="106" y="88" width="8" height="8" fill="#000" />
        <rect x="122" y="80" width="8" height="8" fill="#000" />
        <rect x="138" y="80" width="8" height="8" fill="#000" />
        <rect x="154" y="88" width="8" height="8" fill="#000" />
        <rect x="170" y="80" width="8" height="8" fill="#000" />
        <rect x="10" y="96" width="8" height="8" fill="#000" />
        <rect x="26" y="104" width="8" height="8" fill="#000" />
        <rect x="42" y="96" width="8" height="8" fill="#000" />
        <rect x="58" y="96" width="8" height="8" fill="#000" />
        <rect x="74" y="104" width="8" height="8" fill="#000" />
        <rect x="90" y="96" width="8" height="8" fill="#000" />
        <rect x="106" y="96" width="8" height="8" fill="#000" />
        <rect x="122" y="104" width="8" height="8" fill="#000" />
        <rect x="138" y="96" width="8" height="8" fill="#000" />
        <rect x="154" y="96" width="8" height="8" fill="#000" />
        <rect x="170" y="104" width="8" height="8" fill="#000" />
        <rect x="10" y="112" width="8" height="8" fill="#000" />
        <rect x="34" y="112" width="8" height="8" fill="#000" />
        <rect x="58" y="112" width="8" height="8" fill="#000" />
        <rect x="82" y="112" width="8" height="8" fill="#000" />
        <rect x="106" y="112" width="8" height="8" fill="#000" />
        <rect x="130" y="112" width="8" height="8" fill="#000" />
        <rect x="154" y="112" width="8" height="8" fill="#000" />
        <rect x="178" y="112" width="8" height="8" fill="#000" />
        <rect x="80" y="130" width="8" height="8" fill="#000" />
        <rect x="96" y="138" width="8" height="8" fill="#000" />
        <rect x="112" y="130" width="8" height="8" fill="#000" />
        <rect x="80" y="146" width="8" height="8" fill="#000" />
        <rect x="96" y="154" width="8" height="8" fill="#000" />
        <rect x="112" y="146" width="8" height="8" fill="#000" />
        <rect x="80" y="162" width="8" height="8" fill="#000" />
        <rect x="96" y="170" width="8" height="8" fill="#000" />
        <rect x="112" y="162" width="8" height="8" fill="#000" />
        <rect x="128" y="130" width="8" height="8" fill="#000" />
        <rect x="144" y="138" width="8" height="8" fill="#000" />
        <rect x="160" y="130" width="8" height="8" fill="#000" />
        <rect x="176" y="138" width="8" height="8" fill="#000" />
        <rect x="128" y="154" width="8" height="8" fill="#000" />
        <rect x="144" y="162" width="8" height="8" fill="#000" />
        <rect x="160" y="154" width="8" height="8" fill="#000" />
        <rect x="176" y="154" width="8" height="8" fill="#000" />
        <rect x="128" y="170" width="8" height="8" fill="#000" />
        <rect x="160" y="178" width="8" height="8" fill="#000" />
        <rect x="176" y="170" width="8" height="8" fill="#000" />
    </svg>
);

export default function TwoFactorModal({
    show,
    handleClose,
    onContinue,
}: TwoFactorModalProps) {
    const [secretKey, setSecretKey] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (show) {
            const generateQr = async () => {
                setIsLoading(true);
                try {
                    const res = await userService.generate2fa();
                    const secretVal = res.data?.data?.secret || res.data?.secret || "";
                    // Backend returns otpauthUrl (not qrCode)
                    const otpauthUrl = res.data?.data?.otpauthUrl || res.data?.data?.qrCode || res.data?.qrCode || "";

                    // Generate actual scannable QR image from the otpauth URL
                    let qrVal = "";
                    if (otpauthUrl) {
                        qrVal = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
                    } else if (secretVal) {
                        const fallbackUrl = `otpauth://totp/MaxumDreams:User?secret=${secretVal}&issuer=MaxumDreams`;
                        qrVal = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fallbackUrl)}`;
                    }

                    setSecretKey(secretVal);
                    setQrCode(qrVal);
                } catch (e: any) {
                    toast.error(e.response?.data?.message || "2FA API not found or failed. Showing Mock QR");
                    const mockSecret = "JBSWY3DPK5XXE3DE";
                    const otpAuthUrl = `otpauth://totp/MaxumDreams:DemoUser?secret=${mockSecret}&issuer=MaxumDreams`;
                    const mockQr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;

                    setSecretKey(mockSecret);
                    setQrCode(mockQr);
                } finally {
                    setIsLoading(false);
                }
            };
            generateQr();
        } else {
            setSecretKey("");
            setQrCode("");
        }
    }, [show]);

    const handleCopy = () => {
        navigator.clipboard.writeText(secretKey).catch(() => { });
    };

    return (
        <CommonModal
            show={show}
            handleClose={handleClose}
            heading="2-Factor Authentication"
            className="security-modal tfa-modal"
        >
            <p className="tfa-modal__sub">
                Using the Google Authenticator app,<br />
                <strong>Scan the QR code below</strong>
            </p>

            <div className="tfa-modal__qr-wrap">
                {isLoading ? (
                    <div style={{ padding: "50px", textAlign: "center" }}>Loading QR...</div>
                ) : qrCode ? (
                    <img src={qrCode} alt="2FA QR Code" className="tfa-modal__qr" />
                ) : (
                    <QRPlaceholder />
                )}
            </div>

            <div className="tfa-modal__key">
                <span>{secretKey || "Generating..."}</span>
                <button type="button" className="tfa-modal__copy-btn" onClick={handleCopy} aria-label="Copy secret key">
                    <CopyIcon />
                </button>
            </div>

            <p className="tfa-modal__hint">
                If you are unable to scan the QR code, please enter this code manually into the app.
            </p>

            <CommonButton title="Continue" className="w-100 security-modal__action-btn" onClick={onContinue} />
        </CommonModal>
    );
}
