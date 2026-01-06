// src/components/VerifyOtp.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import {
  verifyUserOTP,
  fetchUserInfo,
  resendOTP,
  setToken,
  setUser
} from '../../features/authentication/authenticationSlice';
import { Box, Button, TextField, Alert, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const COOLDOWN_SECONDS = 60;
const MAX_RESEND_ATTEMPTS = 5;

/**
 * Lightweight in-file error reporter (best-effort).
 * Sends minimal payload to /api/errors. Returns server result or { ok:false, error }.
 */
async function reportError({ title = 'client-error', error, extra = {} } = {}) {
  try {
    const payload = {
      title,
      error: {
        message: error?.message || String(error),
        name: error?.name || null,
        stack: error?.stack || null,
      },
      extra,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    const res = await fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => null);
      return { ok: false, error: { status: res.status, body: text } };
    }
    const data = await res.json().catch(() => null);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: { message: err?.message || String(err) } };
  }
}

const VerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, setFocus, watch } = useForm({
    defaultValues: { email: '' }
  });

  const reduxUser = useSelector((state) => state.auth.user);
  const reduxStatus = useSelector((state) => state.auth.status);

  const [otpError, setOtpError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const cooldownRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // focus the code field when component mounts
    const t = setTimeout(() => setFocus('code'), 120);
    return () => clearTimeout(t);
  }, [setFocus]);

  useEffect(() => {
    // mounted flag to avoid state updates after unmount
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!resendCooldown) return;
    cooldownRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    };
  }, [resendCooldown]);

  const getCurrentEmail = () => {
    const watched = watch('email');
    if (watched && watched.toString().trim()) return watched.toString().trim();
    return reduxUser?.email || '';
  };

  const redirectToDashboard = () => {
    // replace prevents back-button returning to OTP
    navigate('/dashboard', { replace: true });
  };

  const onSubmit = async (data) => {
    if (!mountedRef.current) return;

    setOtpError(null);
    setInfoMessage(null);

    const email = (reduxUser?.email) ? reduxUser.email : (data.email || getCurrentEmail() || '').toString().trim();
    const code = (data.code || '').toString().trim();

    if (!email) {
      setOtpError('Please enter your email (the one you used to sign up).');
      return;
    }
    if (!code) {
      setOtpError('Please enter the OTP code.');
      return;
    }

    try {
      // verifyUserOTP thunk; unwrap throws on rejection
      const payload = await dispatch(verifyUserOTP({ email, code })).unwrap();

      const token = payload?.token;
      const returnedUser = payload?.user;

      if (token) {
        // set token in redux (slice will persist to localStorage)
        dispatch(setToken(token));
      }

      if (returnedUser) {
        dispatch(setUser(returnedUser));
      }

      // navigate immediately as soon as we have a token (don't block on fetchUserInfo)
      if (token) {
        redirectToDashboard();
      }

      // Best-effort: refresh profile in background. If it fails, show a non-blocking info.
      try {
        const fetchResult = await dispatch(fetchUserInfo(token)).unwrap();
        const fetchedUser = fetchResult?.user ?? fetchResult;
        if (fetchedUser) {
          dispatch(setUser(fetchedUser));
        }
      } catch (fetchErr) {
        const msg = fetchErr?.message || fetchErr?.toString() || 'Unable to refresh user profile';
        if (mountedRef.current) setInfoMessage(msg);
      }
    } catch (err) {
      // Handle verification failure or unexpected errors
      const message = err?.message || err?.payload?.message || 'OTP verification failed.';
      if (mountedRef.current) setOtpError(message);

      // For unexpected/unhandled errors (not plain user failure), report and show full error page.
      // Heuristic: if no payload and there's a stack, treat it as unexpected.
      const isUnexpected = !err?.payload && (err?.stack || err?.name === 'Error');
      if (isUnexpected) {
        const normalized = {
          message: message,
          name: err?.name || null,
          stack: err?.stack || null,
        };
        const report = await reportError({ title: 'otp-verify-unexpected', error: normalized, extra: { email } });
        // navigate to error page with the report
        if (mountedRef.current) {
          navigate('/error', { replace: true, state: { error: normalized, serverReport: report } });
        }
      }
    }
  };

  const handleResend = async () => {
    if (!mountedRef.current) return;

    setOtpError(null);
    setInfoMessage(null);

    const email = reduxUser?.email || getCurrentEmail();
    if (!email) {
      setOtpError('Please enter your email to resend OTP.');
      return;
    }
    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      setOtpError('Max resend attempts reached. Try later.');
      return;
    }
    if (resendCooldown > 0) {
      setOtpError(`Please wait ${resendCooldown}s before resending.`);
      return;
    }

    try {
      const result = await dispatch(resendOTP({ email }));
      if (resendOTP.fulfilled.match(result)) {
        if (mountedRef.current) {
          setInfoMessage('A new OTP has been sent to your email.');
          setResendAttempts((a) => a + 1);
          setResendCooldown(COOLDOWN_SECONDS);
        }
      } else {
        const message = result.payload?.message || result.error?.message || 'Failed to resend OTP';
        if (mountedRef.current) setOtpError(message);
      }
    } catch (err) {
      // report the unexpected resend error and show friendly message
      const normalized = {
        message: err?.message || 'Unable to resend OTP',
        name: err?.name || null,
        stack: err?.stack || null,
      };
      await reportError({ title: 'otp-resend-unexpected', error: normalized, extra: { email } });
      if (mountedRef.current) setOtpError('Unable to resend OTP right now. Try later.');
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mt: 8, mx: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Verify OTP</Typography>

      {!reduxUser?.email && (
        <TextField
          label="Email"
          name="email"
          type="email"
          defaultValue=""
          fullWidth
          margin="normal"
          {...register('email', { required: true })}
          helperText="Enter the email you used to sign up."
        />
      )}

      {reduxUser?.email && (
          <TextField label="Email" defaultValue={reduxUser.email}  disabled fullWidth/>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="OTP Code"
          name="code"
          inputProps={{ inputMode: 'numeric', maxLength: 6 }}
          fullWidth
          margin="normal"
          {...register('code', {
            required: 'OTP code is required',
            pattern: { value: /^[0-9]{4,6}$/, message: 'Enter numeric OTP' }
          })}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={reduxStatus === 'loading'}
          sx={{ mt: 1 }}
        >
          {reduxStatus === 'loading' ? 'Verifying...' : 'Verify OTP'}
        </Button>
      </form>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2">Didn't get it?</Typography>
        <Box>
          <Button
            onClick={handleResend}
            disabled={resendCooldown > 0 || reduxStatus === 'loading' || resendAttempts >= MAX_RESEND_ATTEMPTS}
          >
            Resend OTP
          </Button>
          {resendCooldown > 0 && (
            <Typography variant="caption" sx={{ ml: 1 }}>
              ({resendCooldown}s)
            </Typography>
          )}
        </Box>
      </Box>

      {infoMessage && <Alert severity="info" sx={{ mt: 2 }}>{infoMessage}</Alert>}
      {otpError && <Alert severity="error" sx={{ mt: 2 }}>{otpError}</Alert>}

      <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
        If you still have trouble, check your spam folder or contact support.
      </Typography>
    </Box>
  );
};

export default VerifyOtp;
