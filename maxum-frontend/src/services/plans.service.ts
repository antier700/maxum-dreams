import http from "./axiosInstance";
import { PLANS_URLS } from "@/constants/urls";

export const plansService = {
  getPlans: () => http.get(PLANS_URLS.LIST),
};
