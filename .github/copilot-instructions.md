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

- Single slice for auth: `src/features/authentication/authenticationSlice.js`.
  - Uses createAsyncThunk for async flows (signupUser, loginUser, verifyUserOTP, fetchUserInfo, etc.).
  - Stores `user`, `token`, `verified`, `status`, `error`. LocalStorage used for token and user.
  - Error handling: thunks rejectWithValue with message; slice uses addMatcher to handle pending/fulfilled/rejected.
- Services call the backend in `src/features/authentication/authenticationService.js`. API base is hard-coded to `http://localhost:8000`.
- Routing protection happens in `src/routes/AppRoutes.jsx` (routes check `token` and `verified`) and `Authenticator.jsx` expects `token` and `user` to fetch user info.

## Conventions and patterns for edits

- When adding async behavior, follow the existing pattern:
  - Add a service function in `authenticationService.js` that returns an axios call.
  - Add createAsyncThunk in `authenticationSlice.js` that calls the service and uses `rejectWithValue` on errors.
  - Rely on existing addMatcher calls in the slice for generic pending/fulfilled/rejected behavior.
- Persisting auth: reducers write to `localStorage` directly (see verifyUserOTP and logout). If you change this, update both reducers and any code that reads `localStorage` fallback.
- For components that need auth headers, prefer passing token from thunk arg or reading via getState inside the thunk (see fetchUserInfo). Avoid sprinkling axios defaults globally without checking tests.
- Form handling uses `react-hook-form` (see `Login.jsx` and other auth pages). Use the same register/handleSubmit pattern and MUI components for UI consistency.

## Important files to reference (examples)

- Auth slice: `src/features/authentication/authenticationSlice.js` — shows thunk patterns, localStorage usage and error extraction helper.
- Auth service: `src/features/authentication/authenticationService.js` — shows endpoint routes and header usage.
- Store: `src/app/store.js` — how reducers are wired (auth under `state.auth`).
- Routes: `src/routes/AppRoutes.jsx` — route guards and redirects.
- Component example: `src/pages/authentication/Login.jsx` — dispatching `loginUser` then navigating to `/verify-otp`.

## Developer workflows (how to run & debug)

- Start dev server: `npm start` (Create React App). The app expects a backend at `http://localhost:8000` for auth endpoints.
- Build: `npm run build`. Tests: `npm test` (CRA test runner).
- Debugging auth issues: check `localStorage` keys `token` and `user`. `authenticationSlice` logs parsing errors to console; follow that pattern for additional debug logs.

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
