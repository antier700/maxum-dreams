import http from "./axiosInstance";
import { CONTACT_URLS } from "@/constants/urls";

export interface ContactSubmitPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactService = {
  submit: (payload: ContactSubmitPayload) =>
    http.post<{ success: boolean; data?: { id: string }; message?: string }>(
      CONTACT_URLS.SUBMIT,
      payload
    ),
};
