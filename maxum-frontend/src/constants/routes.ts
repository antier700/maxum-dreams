export const PUBLIC_ROUTES = ["/", "/register", "/forgot-password"];
export const PRIVATE_ROUTES = ["/dashboard", "/settings"];

export const DEFAULT_REDIRECTS = {
  afterLogin: "/dashboard",
  afterLogout: "/",
  register: "/register",
};
