import axios from "axios";
import { getToken } from "@/utils/storage";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000, // 15 seconds — prevents infinite loading on unresponsive backend
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const publicRoutes = [
          "/login",
          "/signup",
          "/forgot-password",
          "/verify-code",
          "/change-password",
          "/reset-password",
          "/staking",
        ];
        const isPublicRoute = publicRoutes.some((r) => window.location.pathname.startsWith(r));
        if (!isPublicRoute) {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default http;