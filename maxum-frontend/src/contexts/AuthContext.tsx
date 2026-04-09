"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { AuthUser, AuthState } from "@/types/auth.types";
import { getToken, getUser, setToken, setUser, clearAuth } from "@/utils/storage";
import { userService } from "@/services/user.service";
import { logoutAction } from "@/lib/redux/slices/authSlice";
import type { AppDispatch } from "@/lib/redux/store";

interface AuthContextType extends AuthState {
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Paths guests may open without being sent to /login */
const ROUTES_ALLOWED_WITHOUT_AUTH = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-code",
  /** Forgot-password flow: OTP verified while logged out; must reach reset form without auth */
  "/change-password",
  "/reset-password",
  "/staking",
];

/** Logged-in users on these paths are redirected to the app dashboard */
const ROUTES_REDIRECT_AUTHENTICATED_TO_DASHBOARD = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-code",
  "/reset-password",
];

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some(
    (r) => pathname === r || (r !== "/" && pathname.startsWith(`${r}/`))
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const user = getUser<AuthUser>();

      if (token && user) {
        try {
          const res = await userService.getProfile();
          const currentUser: AuthUser = res.data?.data ?? res.data;
          setToken(token);
          setUser(currentUser);
          setAuthState({ user: currentUser, token, isAuthenticated: true, isLoading: false });
        } catch {
          clearAuth();
          setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (authState.isLoading) return;

    const allowedWithoutAuth = matchesRoute(pathname, ROUTES_ALLOWED_WITHOUT_AUTH);
    const redirectAuthedToDashboard = matchesRoute(
      pathname,
      ROUTES_REDIRECT_AUTHENTICATED_TO_DASHBOARD
    );

    if (!authState.isAuthenticated && !allowedWithoutAuth) {
      router.replace("/login");
    } else if (authState.isAuthenticated && redirectAuthedToDashboard) {
      router.replace("/dashboard");
    }
  }, [authState.isLoading, authState.isAuthenticated, pathname, router]);

  const login = (token: string, user: AuthUser) => {
    setToken(token);
    setUser(user);
    setAuthState({ user, token, isAuthenticated: true, isLoading: false });
  };

  const logout = () => {
    dispatch(logoutAction());
    setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
