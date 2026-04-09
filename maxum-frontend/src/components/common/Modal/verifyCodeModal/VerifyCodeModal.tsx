"use client";

import { useState, useRef } from "react";
import CommonModal from "@/components/common/Modal/CommonModal";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import "../securityModals.scss";

interface VerifyCodeModalProps {
    show: boolean;
    handleClose: () => void;
    email?: string;
    onSubmit?: (code: string) => void;
    onResend?: () => void;
}

export default function VerifyCodeModal({
    show,
    handleClose,
    email = "johnwick007@gmail.com",
    onSubmit,
    onResend,
}: VerifyCodeModalProps) {
    const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...digits];
        next[index] = value;
        setDigits(next);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <CommonModal
            show={show}
            handleClose={handleClose}
            heading="Enter Verification Code"
            className="security-modal verify-code-modal"
        >
            <p className="verify-code-modal__sub">
                A text message with 6-digit code has been sent to{" "}
                <span className="text-warning">{email}</span>. This helps us keep you account
                secure by verifying that it&apos;s really you.
            </p>

            <div className="verify-code-modal__otp-row">
                {digits.map((d, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className={`verify-code-modal__otp-cell ${d ? "filled" : ""}`}
                    />
                ))}
            </div>

            <div className="verify-code-modal__resend-row">
                <button type="button" className="verify-code-modal__resend-btn" onClick={onResend}>
                    Resend Code
                </button>
            </div>

            <CommonButton
                title="Submit"
                className="w-100 security-modal__action-btn mt-3"
                onClick={() => onSubmit?.(digits.join(""))}
            />
        </CommonModal>
    );
}
