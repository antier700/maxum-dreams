"use client";

import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import InputField from "@/components/common/ui/formik/inputField/InputField";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import AuthBrandPanel from "@/components/common/AuthBrandPanel/AuthBrandPanel";
import { resetPasswordThunk } from "@/lib/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import "../login/login.scss";

const changePasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

interface ChangePasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const searchParams = useSearchParams();
  const [resetDone, setResetDone] = useState(false);

  const resetToken = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    const result = await dispatch(
      resetPasswordThunk({
        token: resetToken || email.trim(),
        newPassword: values.newPassword.trim(),
      })
    );

    if (resetPasswordThunk.fulfilled.match(result)) {
      toast.success("Password changed successfully!");
      setResetDone(true);
    } else {
      toast.error((result.payload as string) || "Failed to change password. Please try again.");
    }
  };

  return (
    <div className="auth-page change-password-page">
      <Container fluid className="p-0 h-100">
        <Row className="min-vh-100 g-0">
          <Col lg={6} className="auth-page__brand d-none d-lg-flex">
            <AuthBrandPanel />
          </Col>

          <Col lg={6} className="auth-page__form-wrapper">
            <div className="auth-page__form-container">
           
              <div className="auth-page__form-header">
                <h2 className="auth-page__form-title">Change Password</h2>
                <p className="auth-page__form-subtitle">
                  Enter your new password below to reset your account.
                </p>
              </div>

              {resetDone ? (
                <div className="auth-form">
                  <p className="auth-page__form-subtitle mb-4">
                    Your password has been updated. You can sign in with your new password when you&apos;re ready.
                  </p>
                  <Link href="/login" className="auth-form__link d-inline-block mb-3">
                    Go to Sign In
                  </Link>
                </div>
              ) : (
                <Formik
                  initialValues={{ newPassword: "", confirmPassword: "" }}
                  validationSchema={changePasswordSchema}
                  validateOnBlur
                  validateOnChange
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched, values, setFieldValue, handleBlur, isSubmitting }) => (
                    <Form className="auth-form" noValidate>
                      <InputField
                        label="New Password"
                        name="newPassword"
                        type="password"
                        placeholder="Enter New Password"
                        value={values.newPassword}
                        onChange={(e) => setFieldValue("newPassword", e.target.value)}
                        onBlur={handleBlur}
                        error={touched.newPassword && errors.newPassword}
                      />

                      <InputField
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Enter Confirm Password"
                        value={values.confirmPassword}
                        onChange={(e) => setFieldValue("confirmPassword", e.target.value)}
                        onBlur={handleBlur}
                        error={touched.confirmPassword && errors.confirmPassword}
                      />

                      <CommonButton
                        type="submit"
                        title="Confirm"
                        fluid
                        isLoading={isLoading}
                        disabled={isLoading || isSubmitting}
                        className="auth-form__submit mt-3"
                      />

                      <div className="auth-form__footer">
                        <p>
                          Remember your password?{" "}
                          <Link href="/login" className="auth-form__link">
                            Sign In
                          </Link>
                        </p>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
