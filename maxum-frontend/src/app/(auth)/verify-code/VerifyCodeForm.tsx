"use client";

import { Container, Row, Col } from "react-bootstrap";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import OtpField from "@/components/common/ui/OTP/OtpField";
import InputField from "@/components/common/ui/formik/inputField/InputField";
import AuthBrandPanel from "@/components/common/AuthBrandPanel/AuthBrandPanel";
import { useAuth } from "@/contexts/AuthContext";
import {
  verifyOtpThunk,
  verifyLoginOtpThunk,
  resendVerificationEmailThunk,
  resendLoginOtpThunk,
} from "@/lib/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import "../login/login.scss";

export default function VerifyCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { login } = useAuth();
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const email = searchParams.get("email") || "";
  // flow: 'login' | 'forgot' | 'signup'
  const flow = searchParams.get("flow") || "signup";
  const requires2FA = searchParams.get("requires2fa") === "true";

  const [otpValue, setOtpValue] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async () => {
    if (otpValue.length < 6) return;

    if (flow === "login") {
      if (requires2FA && twoFactorCode.length < 6) {
        toast.error("Please enter your 6-digit authenticator code.");
        return;
      }

      const result = await dispatch(
        verifyLoginOtpThunk({
          email,
          otp: otpValue,
          ...(requires2FA ? { twoFactorCode } : {}),
        })
      );

      if (verifyLoginOtpThunk.fulfilled.match(result)) {
        login(result.payload.token, result.payload.user);
        toast.success("Logged in successfully!");
        router.push("/dashboard");
      } else {
        toast.error((result.payload as string) || "Verification failed. Please try again.");
      }
      return;
    }

    // forgot / signup flows
    const result = await dispatch(
      verifyOtpThunk({ email, otp: otpValue, flow: flow === "signup" ? "signup" : "forgot" })
    );

    if (verifyOtpThunk.fulfilled.match(result)) {
      if (flow === "forgot") {
        toast.success("OTP verified successfully!");
        router.push(`/change-password?email=${encodeURIComponent(email)}`);
      } else {
        const authData = result.payload.data;
        if (!authData?.token) {
          toast.error("Verification succeeded, but login data is missing. Please sign in.");
          router.push("/login");
          return;
        }

        login(authData.token, {
          id: authData.id,
          name: authData.name,
          email: authData.email,
        });
        toast.success("Account verified! You are now logged in.");
        router.push("/dashboard");
      }
    } else {
      toast.error((result.payload as string) || "Invalid OTP. Please try again.");
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);

    if (flow === "login") {
      const result = await dispatch(resendLoginOtpThunk({ email }));
      if (resendLoginOtpThunk.fulfilled.match(result)) {
        toast.success("OTP resent successfully!");
      } else {
        toast.error((result.payload as string) || "Failed to resend OTP.");
      }
    } else {
      const result = await dispatch(
        resendVerificationEmailThunk({ email, flow: flow === "signup" ? "signup" : "forgot" })
      );
      if (resendVerificationEmailThunk.fulfilled.match(result)) {
        toast.success("OTP resent successfully!");
      } else {
        toast.error((result.payload as string) || "Failed to resend OTP.");
      }
    }

    setIsResending(false);
  };

  const backHref =
    flow === "login"
      ? "/login"
      : flow === "forgot"
      ? "/forgot-password"
      : "/signup";

  return (
    <div className="auth-page verify-code-page">
      <Container fluid className="p-0 h-100">
        <Row className="min-vh-100 g-0">
          <Col lg={6} className="auth-page__brand d-none d-lg-flex">
            <AuthBrandPanel />
          </Col>

          <Col lg={6} className="auth-page__form-wrapper">
            <div className="auth-page__form-container">
              <Link href={backHref} className="auth-back-btn">
                ← Back
              </Link>

              <div className="auth-page__form-header">
                <h2 className="auth-page__form-title">
                  {flow === "login" ? "Verify Your Identity" : "Enter Verification Code"}
                </h2>
                <p className="auth-page__form-subtitle">
                  {flow === "login"
                    ? "A 6-digit sign-in code has been sent to "
                    : "A 6-digit code has been sent to "}
                  {email && <span className="auth-form__link">{email}</span>}.{" "}
                  {flow === "login"
                    ? "Enter it below to complete your sign in."
                    : "This helps us keep your account secure."}
                </p>
              </div>

              <OtpField
                value={otpValue}
                onChange={setOtpValue}
                numInputs={6}
                shouldAutoFocus
              />

              {flow === "login" && requires2FA && (
                <div className="mt-4">
                  <p className="auth-page__form-subtitle mb-2">
                    This account has 2FA enabled. Enter the 6-digit code from your authenticator app.
                  </p>
                  <InputField
                    label="Authenticator Code *"
                    name="twoFactorCode"
                    type="text"
                    placeholder="Enter 6-digit authenticator code"
                    value={twoFactorCode}
                    onChange={(e) =>
                      setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                  />
                </div>
              )}

              <div className="auth-form__options justify-content-end mt-3 mb-4">
                <button
                  type="button"
                  className="auth-form__link bg-transparent border-0 p-0"
                  onClick={handleResend}
                  disabled={isResending}
                >
                  {isResending ? "Resending..." : "Resend Code"}
                </button>
              </div>

              <CommonButton
                title="Verify"
                fluid
                isLoading={isLoading}
                onClick={handleSubmit}
                disabled={
                  otpValue.length < 6 ||
                  (flow === "login" && requires2FA && twoFactorCode.length < 6) ||
                  isLoading
                }
                className="auth-form__submit"
              />

              <div className="auth-form__footer">
                <p>
                  Back to{" "}
                  <Link href="/login" className="auth-form__link">Sign In</Link>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
