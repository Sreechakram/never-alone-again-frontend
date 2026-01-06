// src/features/authentication/authenticationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authService from "./authenticationService";

// Safe localStorage helper
const readLocal = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

// Initialize from localStorage
const tokenFromStorage = readLocal("token");
let userFromStorage = null;
try {
  const u = readLocal("user");
  if (u && u !== "undefined") userFromStorage = JSON.parse(u);
} catch {
  userFromStorage = null;
}

// Robust error extractor
const extractErrorMessage = (err, fallback = "Request failed") => {
  const data = err?.response?.data;
  if (data?.message) return data.message;
  if (typeof data === "string") return data;
  if (err?.message) return err.message;
  return fallback;
};

// -------------------- Thunks --------------------
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.signup(data);
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: extractErrorMessage(err, "Signup failed"),
      });
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.login(data);
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: extractErrorMessage(err, "Login failed"),
      });
    }
  }
);

export const verifyUserOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.verifyOTP(data);
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: extractErrorMessage(err, "OTP verification failed"),
      });
    }
  }
);

export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.resendOTP(data);
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: extractErrorMessage(err, "Resend OTP failed"),
      });
    }
  }
);

// export const fetchUserInfo = createAsyncThunk(
//   "auth/fetchUserInfo",
//   async (tokenArg, { getState, rejectWithValue }) => {
//     try {
//       let token = tokenArg || getState().auth.token || readLocal("token");
//       if (!token) return rejectWithValue({ message: "No token available" });
//       const res = await authService.getUserInfo(token);
//       return res.data; // expect { status:true, user }
//     } catch (err) {
//       return rejectWithValue({
//         message: extractErrorMessage(err, "Failed to fetch user info"),
//       });
//     }
//   }
// );

export const fetchUserInfo = createAsyncThunk(
  'auth/fetchUserInfo',
  async (tokenArg, { getState, rejectWithValue }) => {
    try {
      let token = tokenArg || getState().auth.token || readLocal('token');
      if (!token) return rejectWithValue({ message: 'No token available' });

      // call service
      const res = await authService.getUserInfo(token);

      // axios for 304 will still resolve, but res.status may be 304 and res.data undefined.
      if (res.status === 304 || !res.data) {
        // fallback to last-known user in storage (if available)
        const stored = readLocal('user');
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch { /* fall through */ }
        }
        return rejectWithValue({ message: 'No updated user info (304) and no cached user' });
      }

      return res.data;
    } catch (err) {
      return rejectWithValue({ message: extractErrorMessage(err, 'Failed to fetch user info') });
    }
  }
);


export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.forgotPassword(data);
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: extractErrorMessage(err, "Forgot password failed"),
      });
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.resetPassword(data);
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: extractErrorMessage(err, "Reset password failed"),
      });
    }
  }
);

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async ({ data, token }, { rejectWithValue }) => {
    try {
      const res = await authService.updateUser(data, token);
      return res.data;
    } catch (err) {
      return rejectWithValue({
        message: extractErrorMessage(err, "Update failed"),
      });
    }
  }
);

// -------------------- Slice --------------------
const authenticationSlice = createSlice({
  name: "auth",
  initialState: {
    user: userFromStorage,
    token: tokenFromStorage,
    verified: !!userFromStorage,
    status: "idle",
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.verified = false;
      state.status = "idle";
      state.error = null;
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch {}
    },
    clearError: (state) => {
      state.error = null;
    },
    // Manual setters used by components (Otp.jsx)
    setToken: (state, action) => {
      state.token = action.payload;
      state.verified = !!action.payload || state.verified; // mark verified when token set
      try { localStorage.setItem('token', action.payload); } catch {}
    },
    setUser: (state, action) => {
      state.user = action.payload;
      try {
        localStorage.setItem("user", JSON.stringify(action.payload));
      } catch {}
    },
  },
  extraReducers: (builder) => {
    builder
      // handle token returned on OTP verify
      // .addCase(verifyUserOTP.fulfilled, (state, action) => {
      //   const payload = action.payload || {};
      //   state.token = payload.token ?? state.token;
      //   if (state.token) {
      //     try { localStorage.setItem('token', state.token); } catch {}
      //   }
      //   // if backend returned user object, set it
      //   if (payload.user) {
      //     state.user = payload.user;
      //     try { localStorage.setItem('user', JSON.stringify(payload.user)); } catch {}
      //   }
      //   state.verified = !!payload.user || state.verified;
      // })
      // handle token returned on OTP verify
      .addCase(verifyUserOTP.fulfilled, (state, action) => {
        const payload = action.payload || {};

        // If backend returned token, set it and persist
        if (payload.token) {
          state.token = payload.token;
          try {
            localStorage.setItem("token", state.token);
          } catch {}
        }

        // If backend returned a user, set it and persist
        if (payload.user) {
          state.user = payload.user;
          try {
            localStorage.setItem("user", JSON.stringify(payload.user));
          } catch {}
        }

        // Mark verified true if we have either a user or a token
        state.verified = !!payload.user || !!payload.token || state.verified;
      })

      // fetchUserInfo returns { status:true, user } or user directly
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        const payload = action.payload || {};
        state.user = payload.user ?? payload;
        try {
          localStorage.setItem("user", JSON.stringify(state.user));
        } catch {}
      })

      // Generic matchers
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = "failed";
          state.error =
            action.payload?.message ||
            action.error?.message ||
            "Request failed";
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled"),
        (state) => {
          state.status = "succeeded";
          state.error = null;
        }
      );
  },
});

export const { logout, clearError, setToken, setUser } =
  authenticationSlice.actions;
export default authenticationSlice.reducer;
