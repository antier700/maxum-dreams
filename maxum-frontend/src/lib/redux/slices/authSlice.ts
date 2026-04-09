import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/services/auth.service";
import { setToken, setUser, clearAuth } from "@/utils/storage";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// ─── Error helper ─────────────────────────────────────────────────────────────

const parseError = (error: unknown): string => {
  const err = error as { code?: string; response?: { data?: { message?: string } } };
  if (err.code === "ECONNABORTED") return "Request timed out. Please try again.";
  return err.response?.data?.message || "Something went wrong. Please try again.";
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authService.register(payload);
      return res.data.data; // { requiresOtp, email }
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  }
);

/**
 * Step 1: validate credentials → triggers email OTP.
 * Returns { requiresOtp, requires2FA, email } — no JWT yet.
 */
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authService.login(credentials);
      return res.data.data; // { requiresOtp, requires2FA, email }
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  }
);

/**
 * Step 2: verify email OTP (+ optional TOTP) → returns JWT.
 */
export const verifyLoginOtpThunk = createAsyncThunk(
  "auth/verifyLoginOtp",
  async (
    payload: { email: string; otp: string; twoFactorCode?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await authService.verifyLoginOtp(payload);
      const { token, id, name, email } = res.data.data;
      const user: AuthUser = { id, name, email };
      setToken(token);
      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      return { token, user };
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  }
);

export const resendLoginOtpThunk = createAsyncThunk(
  "auth/resendLoginOtp",
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const res = await authService.resendLoginOtp(payload);
      return res.data.message;
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  "auth/forgotPassword",
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const res = await authService.forgotPassword(payload);
      return res.data.message;
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  "auth/resetPassword",
  async (payload: { token: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const res = await authService.resetPassword(payload);
      return res.data.message;
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  "auth/changePassword",
  async (payload: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const res = await authService.changePassword(payload);
      return res.data.message;
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  }
);

export const verifyEmailThunk = createAsyncThunk(
  "auth/verifyEmail",
  async (payload: { token: string }, { rejectWithValue }) => {
    try {
      const res = await authService.verifyEmail(payload);
      return res.data.message;
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  }
);

export const resendVerificationEmailThunk = createAsyncThunk(
  "auth/resendVerificationEmail",
  async (payload: { email: string; flow?: "forgot" | "signup" }, { rejectWithValue }) => {
    try {
      const res = await authService.resendVerificationEmail(payload);
      return res.data.message;
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  }
);

export const verifyOtpThunk = createAsyncThunk(
  "auth/verifyOtp",
  async (
    payload: { email: string; otp: string; flow?: "forgot" | "signup" },
    { rejectWithValue }
  ) => {
    try {
      const res = await authService.verifyOtp(payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(parseError(error));
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const pending = (state: AuthState) => {
  state.isLoading = true;
  state.error = null;
};
const rejected = (state: AuthState, action: { payload: unknown }) => {
  state.isLoading = false;
  state.error = action.payload as string;
};
const done = (state: AuthState) => {
  state.isLoading = false;
  state.error = null;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutAction(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      clearAuth();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerThunk.pending, pending)
      .addCase(registerThunk.fulfilled, done)
      .addCase(registerThunk.rejected, rejected);

    // Login (step 1 — no token stored yet)
    builder
      .addCase(loginThunk.pending, pending)
      .addCase(loginThunk.fulfilled, done)
      .addCase(loginThunk.rejected, rejected);

    // Verify login OTP (step 2 — stores token + user)
    builder
      .addCase(verifyLoginOtpThunk.pending, pending)
      .addCase(verifyLoginOtpThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(verifyLoginOtpThunk.rejected, rejected);

    // Resend login OTP
    builder
      .addCase(resendLoginOtpThunk.pending, pending)
      .addCase(resendLoginOtpThunk.fulfilled, done)
      .addCase(resendLoginOtpThunk.rejected, rejected);

    // Forgot password
    builder
      .addCase(forgotPasswordThunk.pending, pending)
      .addCase(forgotPasswordThunk.fulfilled, done)
      .addCase(forgotPasswordThunk.rejected, rejected);

    // Reset password
    builder
      .addCase(resetPasswordThunk.pending, pending)
      .addCase(resetPasswordThunk.fulfilled, done)
      .addCase(resetPasswordThunk.rejected, rejected);

    // Change password
    builder
      .addCase(changePasswordThunk.pending, pending)
      .addCase(changePasswordThunk.fulfilled, done)
      .addCase(changePasswordThunk.rejected, rejected);

    // Verify email
    builder
      .addCase(verifyEmailThunk.pending, pending)
      .addCase(verifyEmailThunk.fulfilled, done)
      .addCase(verifyEmailThunk.rejected, rejected);

    // Resend verification email
    builder
      .addCase(resendVerificationEmailThunk.pending, pending)
      .addCase(resendVerificationEmailThunk.fulfilled, done)
      .addCase(resendVerificationEmailThunk.rejected, rejected);

    // Verify OTP (forgot-password flow)
    builder
      .addCase(verifyOtpThunk.pending, pending)
      .addCase(verifyOtpThunk.fulfilled, done)
      .addCase(verifyOtpThunk.rejected, rejected);
  },
});

export const { logoutAction, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
