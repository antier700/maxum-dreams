import http from "./axiosInstance";
import { USER_URLS } from "@/constants/urls";

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  dob?: string;
  phone?: string;
  gender?: string;
  street?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  profilePicture?: string;
  [key: string]: unknown;
}

export const userService = {
  getProfile: () => http.get(USER_URLS.PROFILE),

  updateProfile: (payload: UpdateUserPayload) =>
    http.put(USER_URLS.UPDATE, payload),

  changePassword: (payload: any) => http.post("/user/auth/change-password", payload),
  generate2fa: () => http.get("/user/2fa/generate"),
  /** Verify code to enable 2FA, or pass `{ enabled: false }` to disable (same as backend POST /user/2fa/verify). */
  verify2fa: (payload: { code?: string; enabled?: boolean }) =>
    http.post("/user/2fa/verify", payload),
  toggle2fa: (payload: { enabled: boolean }) => http.post("/user/2fa/verify", payload),
};
