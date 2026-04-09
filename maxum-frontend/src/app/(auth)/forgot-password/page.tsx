"use client";

import { Container, Row, Col } from "react-bootstrap";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import InputField from "@/components/common/ui/formik/inputField/InputField";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import AuthBrandPanel from "@/components/common/AuthBrandPanel/AuthBrandPanel";
import { forgotPasswordThunk } from "@/lib/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { emailFieldSchema } from "@/constants/validation";
import "../login/login.scss";

const forgotPasswordSchema = Yup.object().shape({
  email: emailFieldSchema(),
});

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    const email = values.email.trim();
    const result = await dispatch(forgotPasswordThunk({ email }));

    if (forgotPasswordThunk.fulfilled.match(result)) {
      toast.success(result.payload || "OTP sent to your email!");
      router.push(`/verify-code?email=${encodeURIComponent(email)}&flow=forgot`);
    } else {
      toast.error((result.payload as string) || "Failed to send OTP. Please try again.");
    }
  };

  return (
    <div className="auth-page forgot-password-page">
      <Container fluid className="p-0 h-100">
        <Row className="min-vh-100 g-0">
          <Col lg={6} className="auth-page__brand d-none d-lg-flex">
            <AuthBrandPanel />
          </Col>

          <Col lg={6} className="auth-page__form-wrapper">
            <div className="auth-page__form-container">
              <Link href="/login" className="auth-back-btn">← Back</Link>
              <div className="auth-page__form-header">
                <h2 className="auth-page__form-title">Forgot Password</h2>
                <p className="auth-page__form-subtitle">
                  Enter your email and we&apos;ll send you a code to reset your password.
                </p>
              </div>

              <Formik
                initialValues={{ email: "" }}
                validationSchema={forgotPasswordSchema}
                validateOnBlur
                validateOnChange
                onSubmit={handleSubmit}
              >
                {({ errors, touched, values, setFieldValue, handleBlur, isSubmitting }) => (
                  <Form className="auth-form" noValidate>
                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="Enter your Email"
                      value={values.email}
                      onChange={(e) => setFieldValue("email", e.target.value)}
                      onBlur={handleBlur}
                      error={touched.email && errors.email}
                    />

                    <CommonButton
                      type="submit"
                      title="Continue"
                      fluid
                      isLoading={isLoading}
                      disabled={isLoading}
                      className="auth-form__submit"
                    />

                    <div className="auth-form__footer">
                      <p>
                        Remember your password?{" "}
                        <Link href="/login" className="auth-form__link">Sign In</Link>
                      </p>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
