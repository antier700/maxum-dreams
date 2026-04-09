import http from "./axiosInstance";
import { DASHBOARD_URLS } from "@/constants/urls";

export const dashboardService = {
  getStats: () => http.get(DASHBOARD_URLS.STATS),
};
