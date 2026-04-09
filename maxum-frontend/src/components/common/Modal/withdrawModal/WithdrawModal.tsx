"use client";

import { useState, useEffect, useMemo } from "react";
import CommonModal from "@/components/common/Modal/CommonModal";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import InputField from "@/components/common/ui/formik/inputField/InputField";
import toast from "react-hot-toast";
import "./WithdrawModal.scss";

const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const AMOUNT_RE = /^\d+(\.\d{1,18})?$/;

function parseDisplayBalance(s: string): number {
  const n = parseFloat(String(s).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

interface WithdrawModalProps {
    show: boolean;
    handleClose: () => void;
    walletBalance?: string;
    onWithdraw?: (values: { amount: string; walletAddress: string }) => void;
    isLoading?: boolean;
}

export default function WithdrawModal({
    show,
    handleClose,
    walletBalance = "900.56",
    onWithdraw,
    isLoading = false,
}: WithdrawModalProps) {
    const [values, setValues] = useState({ amount: "", walletAddress: "" });

    useEffect(() => {
        if (!show) {
            setValues({ amount: "", walletAddress: "" });
        }
    }, [show]);

    const withdrawValid = useMemo(() => {
        const amountStr = values.amount.trim();
        const addr = values.walletAddress.trim();
        if (!amountStr || !AMOUNT_RE.test(amountStr)) return false;
        const amountNum = parseFloat(amountStr);
        if (amountNum <= 0) return false;
        const maxBal = parseDisplayBalance(walletBalance);
        if (amountNum > maxBal) return false;
        return ETH_ADDRESS_RE.test(addr);
    }, [values.amount, values.walletAddress, walletBalance]);

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setValues((prev) => ({ ...prev, walletAddress: text.trim() }));
        } catch {
            toast.error("Could not read clipboard. Paste the address manually.");
        }
    };

    const handleUseMetaMaskAddress = async () => {
        const eth = typeof window !== "undefined" ? (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum : undefined;
        if (!eth) {
            toast.error("Install MetaMask or another Web3 wallet and try again.");
            return;
        }
        try {
            const accounts = await eth.request({ method: "eth_requestAccounts" });
            const addr = accounts?.[0]?.trim();
            if (addr) {
                setValues((prev) => ({ ...prev, walletAddress: addr }));
                toast.success("Wallet address filled from MetaMask.");
            }
        } catch {
            toast.error("Could not get address. Approve the connection in your wallet.");
        }
    };

    return (
        <CommonModal
            show={show}
            handleClose={handleClose}
            heading="Withdraw NEXB"
            className="withdraw-modal"
        >
            <div className="withdraw-modal__balance-card">
                <span className="withdraw-modal__balance-value">{walletBalance}</span>
                <span className="withdraw-modal__balance-label">Available balance (in app)</span>
                <p className="withdraw-modal__hint">
                    This is your NEXB balance on the platform. MetaMask may show 0 for NEXB until tokens are sent on-chain after your withdrawal is processed.
                </p>
            </div>

            <p className="withdraw-modal__intro">
                Enter how much to withdraw and the <strong>destination address</strong> where you want to receive NEXB (for example, copy your address from MetaMask: account menu → copy).
            </p>

            <div className="withdraw-modal__fields">
                <InputField
                    label="Amount"
                    name="amount"
                    type="number"
                    placeholder="Enter Amount"
                    value={values.amount}
                    maxLength={25}
                    onChange={(e) => { 
                        if (e.target.value.length <= 25) {
                            setValues((prev) => ({ ...prev, amount: e.target.value }));
                        }
                    }}
                    bottomTitle="Use digits only; up to 25 decimal places. Cannot exceed available balance."
                />
                <div className="withdraw-modal__wallet-block">
                    <InputField
                        label="Wallet Address"
                        name="walletAddress"
                        placeholder="0x… paste your receive address"
                        value={values.walletAddress}
                        onChange={(e) => setValues((prev) => ({ ...prev, walletAddress: e.target.value }))}
                        righttext={<span className="withdraw-modal__paste-btn" onClick={handlePaste}>Paste</span>}
                        righttextOnclick={handlePaste}
                    />
                    <button
                        type="button"
                        className="withdraw-modal__metamask-btn"
                        onClick={handleUseMetaMaskAddress}
                        disabled={isLoading}
                    >
                        Use MetaMask address
                    </button>
                </div>
            </div>

            <CommonButton
                title="Withdraw"
                className="w-100 withdraw-modal__action-btn mt-4"
                onClick={() => {
                    const amount = values.amount.trim();
                    const walletAddress = values.walletAddress.trim();
                    if (!withdrawValid) {
                        toast.error("Enter a valid amount (within balance) and a 0x… wallet address (42 chars).");
                        return;
                    }
                    onWithdraw?.({ amount, walletAddress });
                }}
                isLoading={isLoading}
                disabled={isLoading || !withdrawValid}
            />
        </CommonModal>
    );
}
