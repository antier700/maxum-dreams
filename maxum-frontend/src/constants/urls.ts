/**
 * When the server mounts REST under `/api` and `NEXT_PUBLIC_API_URL` is the origin only
 * (e.g. https://maxum-backend.onrender.com),
 * then set: NEXT_PUBLIC_API_PREFIX=/api
 */

const API_PREFIX = (process.env.NEXT_PUBLIC_API_PREFIX ?? "").replace(/\/$/, "");

const withPrefix = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_PREFIX ? `${API_PREFIX}${p}` : p;
};

// ======================
// AUTH
// ======================
export const AUTH_URLS = {
  REGISTER: withPrefix("/auth/register"),
  LOGIN: withPrefix("/auth/login"),
  VERIFY_LOGIN_OTP: withPrefix("/auth/verify-login-otp"),
  RESEND_LOGIN_OTP: withPrefix("/auth/resend-login-otp"),
  FORGOT_PASSWORD: withPrefix("/auth/forgot-password"),
  RESET_PASSWORD: withPrefix("/auth/reset-password"),
  VERIFY_CODE: withPrefix("/auth/verify-code"),
  VERIFY_OTP: withPrefix("/auth/verify-otp"),
  VERIFY_EMAIL: withPrefix("/auth/verify-email"),
  RESEND_VERIFICATION_EMAIL: withPrefix("/auth/resend-verification-email"),
  CHANGE_PASSWORD: withPrefix("/auth/change-password"),
  LOGOUT: withPrefix("/auth/logout"),
};

// ======================
// USER
// ======================
export const USER_URLS = {
  PROFILE: withPrefix("/user/profile"),
  UPDATE: withPrefix("/user/update"),
};

// ======================
// DASHBOARD
// ======================
export const DASHBOARD_URLS = {
  STATS: withPrefix("/dashboard/stats"),
};

// ======================
// PLANS
// ======================
export const PLANS_URLS = {
  LIST: withPrefix("/plans"),
};

// ======================
// TRANSACTIONS
// ======================
export const TRANSACTION_URLS = {
  HISTORY: withPrefix("/user/transactions"),
  STAKES: withPrefix("/user/stakes"),
  REFERRALS_REWARDS: withPrefix("/user/referrals/rewards"),
  MOCK_DEPOSIT: withPrefix("/user/mock-deposit"),
  WITHDRAW: withPrefix("/user/withdraw"),
  STAKE: withPrefix("/user/stake"),
  UNSTAKE: withPrefix("/user/unstake"),
};

// ======================
// CONTACT
// ======================
export const CONTACT_URLS = {
  SUBMIT: withPrefix("/contact"),
};