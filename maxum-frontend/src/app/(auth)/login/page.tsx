"use client";

import toast from "react-hot-toast";
import { Container, Row, Col } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import InputField from "@/components/common/ui/formik/inputField/InputField";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import "./login.scss";
import AuthBrandPanel from "@/components/common/AuthBrandPanel/AuthBrandPanel";
import { loginThunk } from "@/lib/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { emailFieldSchema } from "@/constants/validation";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const formik = useFormik<LoginFormValues>({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object().shape({
      email: emailFieldSchema(),
      password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
    }),
    onSubmit: async (values: LoginFormValues) => {
      const result = await dispatch(
        loginThunk({ email: values.email.trim(), password: values.password })
      );

      if (loginThunk.fulfilled.match(result)) {
        // Credentials verified — backend sent OTP; redirect to verification screen
        const { email, requires2FA } = result.payload;
        toast.success("A verification code has been sent to your email.");
        router.push(
          `/verify-code?flow=login&email=${encodeURIComponent(email)}&requires2fa=${requires2FA ? "true" : "false"}`
        );
      } else {
        const message = (result.payload as string) || "Login failed. Please try again.";
        toast.error(message);
      }
    },
  });

  return (
    <div className="auth-page login-page">
      <Container fluid className="p-0 h-100">
        <Row className="min-vh-100 g-0">
          <Col lg={6} className="auth-page__brand d-none d-lg-flex">
            <AuthBrandPanel />
          </Col>

          <Col lg={6} className="auth-page__form-wrapper">
            <div className="auth-page__form-container">
              <div className="auth-page__form-header">
                <h2 className="auth-page__form-title">Sign In</h2>
                <p className="auth-page__form-subtitle">Please log in to your account.</p>
              </div>
              <form onSubmit={formik.handleSubmit} className="auth-form" noValidate>
                <InputField
                  label="Email *"
                  name="email"
                  type="email"
                  placeholder="Enter Email"
                  value={formik.values.email}
                  onChange={(e) => formik.setFieldValue("email", e.target.value)}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && formik.errors.email}
                  onInput={formik.handleBlur}
                />

                <InputField
                  label="Password *"
                  name="password"
                  type="password"
                  placeholder="Enter Password"
                  value={formik.values.password}
                  onChange={(e) => formik.setFieldValue("password", e.target.value)}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && formik.errors.password}
                  onInput={formik.handleBlur}
                />

                <div className="auth-form__options">
                  <Link href="/forgot-password" className="auth-form__link">
                    Forgot Password?
                  </Link>
                </div>

                <CommonButton
                  type="submit"
                  title="Sign In"
                  fluid
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="auth-form__submit"
                />

                <div className="auth-form__footer">
                  <p>
                    Don&apos;t have an account yet?{" "}
                    <Link href="/signup" className="auth-form__link">
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
