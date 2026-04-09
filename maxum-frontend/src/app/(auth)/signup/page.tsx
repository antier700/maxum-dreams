"use client";

import { Container, Row, Col } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import InputField from "@/components/common/ui/formik/inputField/InputField";
import CommonButton from "@/components/common/ui/commonButton/CommonButton";
import AuthBrandPanel from "@/components/common/AuthBrandPanel/AuthBrandPanel";
import { registerThunk } from "@/lib/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { emailFieldSchema, nameFieldSchema } from "@/constants/validation";
import "../login/login.scss";

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const formik = useFormik<SignupFormValues>({
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validationSchema: Yup.object({
      name: nameFieldSchema("Full name"),
      email: emailFieldSchema(),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
          "Must contain uppercase, lowercase, number and special character"
        )
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values: SignupFormValues) => {
      const result = await dispatch(registerThunk({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      }));

      if (registerThunk.fulfilled.match(result)) {
        const email = result.payload.email || values.email.trim();
        toast.success("Account created! A verification code has been sent to your email.");
        router.push(`/verify-code?flow=signup&email=${encodeURIComponent(email)}`);
      } else {
        const message = (result.payload as string) || "Signup failed. Please try again.";
        toast.error(message);
        formik.setErrors({ email: message });
        formik.setTouched({ email: true }, false);
      }
    },
  });

  return (
    <div className="auth-page signup-page">
      <Container fluid className="p-0 h-100">
        <Row className="min-vh-100 g-0">
          <Col lg={6} className="auth-page__brand d-none d-lg-flex">
            <AuthBrandPanel />
          </Col>

          <Col lg={6} className="auth-page__form-wrapper">
            <div className="auth-page__form-container">
              <div className="auth-page__form-header">
                <h2 className="auth-page__form-title">Create Account</h2>
                <p className="auth-page__form-subtitle">
                  Fill in the details below to get started.
                </p>
              </div>

              
              <form onSubmit={formik.handleSubmit} className="auth-form" noValidate>
                <InputField
                  label="Full Name *"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formik.values.name}
                  onChange={(e) => formik.setFieldValue("name", e.target.value)}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && formik.errors.name}
                  onInput={formik.handleBlur}
                />

                <InputField
                  label="Email *"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
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
                  placeholder="Enter password"
                  value={formik.values.password}
                  onChange={(e) => formik.setFieldValue("password", e.target.value)}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && formik.errors.password}
                  onInput={formik.handleBlur}
                />

                <InputField
                  label="Confirm Password *"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={formik.values.confirmPassword}
                  onChange={(e) => formik.setFieldValue("confirmPassword", e.target.value)}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  onInput={formik.handleBlur}
                />

                <CommonButton
                  type="submit"
                  title="Create Account"
                  fluid
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="auth-form__submit mt-3"
                />

                <div className="auth-form__footer">
                  <p>
                    Already have an account?{" "}
                    <Link href="/login" className="auth-form__link">
                      Sign In
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
