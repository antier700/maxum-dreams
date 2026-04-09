import http from "./axiosInstance";
import { AUTH_URLS } from "@/constants/urls";

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyLoginOtpPayload {
  email: string;
  otp: string;
  /** Required when the account has 2FA enabled */
  twoFactorCode?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationEmailPayload {
  email: string;
  flow?: "forgot" | "signup";
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  flow?: "forgot" | "signup";
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

/** Returned by POST /auth/login — no token yet, just confirms OTP was sent */
export interface LoginInitResponse {
  success: boolean;
  message: string;
  data: {
    requiresOtp: true;
    requires2FA: boolean;
    email: string;
  };
}

/** Returned by POST /auth/verify-login-otp — contains the JWT */
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    id: string;
    name: string;
    email: string;
    createdAt?: string;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    requiresOtp: true;
    email: string;
  };
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    id: string;
    name: string;
    email: string;
    createdAt?: string;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const authService = {
  // Auth
  register: (payload: RegisterPayload) =>
    http.post<RegisterResponse>(AUTH_URLS.REGISTER, payload),

  /** Step 1: validate credentials and trigger email OTP */
  login: (payload: LoginPayload) =>
    http.post<LoginInitResponse>(AUTH_URLS.LOGIN, payload),

  /** Step 2: verify email OTP (+ TOTP if 2FA enabled) and receive JWT */
  verifyLoginOtp: (payload: VerifyLoginOtpPayload) =>
    http.post<AuthResponse>(AUTH_URLS.VERIFY_LOGIN_OTP, payload),

  resendLoginOtp: (payload: { email: string }) =>
    http.post<MessageResponse>(AUTH_URLS.RESEND_LOGIN_OTP, payload),

  logout: () =>
    http.post<MessageResponse>(AUTH_URLS.LOGOUT),

  // Password recovery
  forgotPassword: (payload: ForgotPasswordPayload) =>
    http.post<MessageResponse>(AUTH_URLS.FORGOT_PASSWORD, payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    http.post<MessageResponse>(AUTH_URLS.RESET_PASSWORD, payload),

  changePassword: (payload: ChangePasswordPayload) =>
    http.post<MessageResponse>(AUTH_URLS.CHANGE_PASSWORD, payload),

  // Email / OTP verification
  verifyEmail: (payload: VerifyEmailPayload) =>
    http.post<MessageResponse>(AUTH_URLS.VERIFY_EMAIL, payload),

  resendVerificationEmail: (payload: ResendVerificationEmailPayload) =>
    http.post<MessageResponse>(AUTH_URLS.RESEND_VERIFICATION_EMAIL, payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    http.post<VerifyOtpResponse>(AUTH_URLS.VERIFY_OTP, payload),
};
