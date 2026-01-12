## Purpose

Help an AI coding assistant quickly become productive in this React + Redux Toolkit frontend.
Keep suggestions focused on this repo's concrete patterns, files, and integration points.

## High-level architecture (what to know first)

- Project bootstrapped with Create React App (see `README.md`).
- Frontend is a React SPA using React Router and Redux Toolkit. Key folders:
  - `src/app` — centralized store (`store.js`).
  - `src/features/*` — feature slices and services. Example: `src/features/authentication/`.
  - `src/pages/*` — route pages (Signup, Login, Otp, Dashboard).
  - `src/components/*` — reusable components (e.g., `components/authentication/Authenticator.jsx`).

## State and auth flow (critical)

- **Single auth slice**: [src/features/authentication/authenticationSlice.js](src/features/authentication/authenticationSlice.js).
  - **Thunks** (all use `rejectWithValue` on error): `signupUser`, `loginUser`, `verifyUserOTP`, `resendOTP`, `forgotPassword`, `resetPassword`, `fetchUserInfo` (commented out).
  - **State shape**: `{ user: {email?}, token, verified: bool, status: 'idle'|'loading'|'succeeded'|'failed', error: {message?} }`.
  - **Persistence**: `token` and `user` stored in `localStorage`; thunks restore from storage on init.
  - **Error handling**: thunks extract messages via `extractErrorMessage()` helper; addMatcher handles pending/fulfilled/rejected for all thunks.
- **Auth flow sequence**: Signup → Login → Verify OTP (sets `verified=true`) → Dashboard. Each page dispatches a thunk and checks `fulfilled.match(action)` or `rejected.match(action)`.
- **Route protection**: [src/routes/AppRoutes.jsx](src/routes/AppRoutes.jsx) guards `/dashboard` (requires `token && verified`), gates `/verify-otp` (requires `user && !verified`), redirects unauth users to `/signup`.
- **API base URL** hardcoded to `http://localhost:8000` in [authenticationService.js](src/features/authentication/authenticationService.js); protected endpoints use `Authorization: Bearer ${token}` header.

## Conventions and patterns for edits

- When adding async behavior, follow the existing pattern:
  - Add a service function in `authenticationService.js` that returns an axios call.
  - Add createAsyncThunk in `authenticationSlice.js` that calls the service and uses `rejectWithValue` on errors.
  - Rely on existing addMatcher calls in the slice for generic pending/fulfilled/rejected behavior.
- Persisting auth: reducers write to `localStorage` directly (see verifyUserOTP and logout). If you change this, update both reducers and any code that reads `localStorage` fallback.
- For components that need auth headers, prefer passing token from thunk arg or reading via getState inside the thunk (see fetchUserInfo). Avoid sprinkling axios defaults globally without checking tests.
- Form handling uses `react-hook-form` (see `Login.jsx` and other auth pages). Use the same register/handleSubmit pattern and MUI components for UI consistency.

## Important files to reference (examples)

- Auth slice: [src/features/authentication/authenticationSlice.js](src/features/authentication/authenticationSlice.js) — all thunks (`signupUser`, `loginUser`, `verifyUserOTP`, `resendOTP`, `forgotPassword`, `resetPassword`), localStorage persistence, error extraction helper.
- Auth service: [src/features/authentication/authenticationService.js](src/features/authentication/authenticationService.js) — all API endpoints and Bearer token usage for protected routes.
- Store: [src/app/store.js](src/app/store.js) — single auth reducer under `state.auth`.
- Routes: [src/routes/AppRoutes.jsx](src/routes/AppRoutes.jsx) — conditional routing based on `token` and `verified` flags; guards `/dashboard`, redirects `/verify-otp` and public routes.
- Auth pages: [src/pages/authentication/Login.jsx](src/pages/authentication/Login.jsx), [Signup.jsx](src/pages/authentication/Signup.jsx), [ForgotPassword.jsx](src/pages/authentication/ForgotPassword.jsx), [ResetPassword.jsx](src/pages/authentication/ResetPassword.jsx), [VerifyOtp.jsx](src/pages/authentication/VerifyOtp.jsx) — each dispatches a thunk and handles fulfilled/rejected branches.
- Authenticator component: [src/components/authentication/Authenticator.jsx](src/components/authentication/Authenticator.jsx) — conditionally renders pages based on auth state (used as fallback or testing component).
- Validation schemas: [src/validation/authentication.js](src/validation/authentication.js) — Yup schemas for signup (username, email, password).

## Developer workflows (how to run & debug)

- **Development**: `npm start` (Create React App). Frontend runs at http://localhost:3000; backend must be available at http://localhost:8000.
- **Build for production**: `npm run build`.
- **Testing**: `npm test` (CRA test runner; watches files automatically).
- **Debugging auth flow**: 
  - Check `localStorage` for keys `token` (string) and `user` (JSON object with email).
  - Read `authenticationSlice` for error extraction helper and localStorage fallback logic.
  - Frontend reloads on file changes; browser DevTools (Redux DevTools extension optional) shows state changes.
  - Common issue: API_URL hardcoded to `localhost:8000` — won't work against deployed backend without override.

## External dependencies & integration notes

- Key libs: React 19, React Router DOM, Redux Toolkit, react-hook-form, axios, MUI (@mui/material), yup for validation.
- Backend contract: endpoints used in `authenticationService.js` (e.g., `/user/signup`, `/user/login`, `/user/verify-otp`, `/user/info`). Changes to these must be coordinated with backend.

## What the AI should *not* change without confirmation

- The global auth shape (`user`, `token`, `verified`) and `localStorage` keys — changing these requires updating route guards and components.
- The API base URL in `authenticationService.js` — if switching to env vars, do so consistently and update README with instructions.

## Quick examples the assistant can use

- Add a new thunk that calls a new endpoint: create service fn in `authenticationService.js`, then createAsyncThunk in the slice and rely on addMatcher for status handling.
- Protect a new route: check `token && verified` like `AppRoutes.jsx` does and redirect to `/verify-otp`.

## If you need more context

- Read `src/features/authentication/*` first for auth flows.
- If behavior around token persistence or route-guarding is unclear, ask the maintainer whether the token or `verified` flag is the source of truth.

---
If any of these integration points or file paths look incorrect or you want the AI to adopt a different convention (e.g., env-based API_URL, centralized axios instance, or using RTK Query), tell me which change you prefer and I'll update this file and make the low-risk code edits.
