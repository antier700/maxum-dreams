/**
 * When the server mounts REST under `/api` and `NEXT_PUBLIC_API_URL` is the origin only
 * (e.g. `http://localhost:4000`), set `NEXT_PUBLIC_API_PREFIX=/api` in `.env.local`.
 * If your API URL already ends with `/api`, leave this unset.
 */
const API_PREFIX = (process.env.NEXT_PUBLIC_API_PREFIX ?? "").replace(/\/$/, "");

const withPrefix = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_PREFIX ? `${API_PREFIX}${p}` : p;
};

export const AUTH_URLS = {
  REGISTER: withPrefix("/api/auth/register"),
  LOGIN: withPrefix("/api/auth/login"),
  VERIFY_LOGIN_OTP: withPrefix("/api/auth/verify-login-otp"),
  RESEND_LOGIN_OTP: withPrefix("/api/auth/resend-login-otp"),
  FORGOT_PASSWORD: withPrefix("/api/auth/forgot-password"),
  RESET_PASSWORD: withPrefix("/api/auth/reset-password"),
  VERIFY_CODE: withPrefix("/api/auth/verify-code"),
  VERIFY_OTP: withPrefix("/api/auth/verify-otp"),
  VERIFY_EMAIL: withPrefix("/api/auth/verify-email"),
  RESEND_VERIFICATION_EMAIL: withPrefix("/api/auth/resend-verification-email"),
  CHANGE_PASSWORD: withPrefix("/api/auth/change-password"),
  LOGOUT: withPrefix("/api/auth/logout"),
};

export const USER_URLS = {
  PROFILE: withPrefix("/api/user/profile"),
  UPDATE: withPrefix("/api/user/update"),
};

export const DASHBOARD_URLS = {
  STATS: withPrefix("/api/dashboard/stats"),
};

export const PLANS_URLS = {
  LIST: withPrefix("/api/plans"),
};

export const TRANSACTION_URLS = {
  HISTORY: withPrefix("/api/user/transactions"),
  STAKES: withPrefix("/api/user/stakes"),
  REFERRALS_REWARDS: withPrefix("/api/user/referrals/rewards"),
  MOCK_DEPOSIT: withPrefix("/api/user/mock-deposit"),
  WITHDRAW: withPrefix("/api/user/withdraw"),
  STAKE: withPrefix("/api/user/stake"),
  UNSTAKE: withPrefix("/api/user/unstake"),
};

export const CONTACT_URLS = {
  SUBMIT: withPrefix("/api/contact"),
};
