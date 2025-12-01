import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { verifyUserOTP, fetchUserInfo, resendOTP, setToken, setUser } from '../../features/authentication/authenticationSlice';
import { Box, Button, TextField, Alert, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const COOLDOWN_SECONDS = 60;
const MAX_RESEND_ATTEMPTS = 5;

const Otp = () => {
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

  useEffect(() => { setTimeout(() => setFocus('code'), 120); }, [setFocus]);

  useEffect(() => {
    if (!resendCooldown) return;
    cooldownRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(cooldownRef.current); cooldownRef.current = null; return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, [resendCooldown]);

  const getCurrentEmail = () => {
    const watched = watch('email');
    if (watched && watched.toString().trim()) return watched.toString().trim();
    return reduxUser?.email || '';
  };

  const onSubmit = async (data) => {
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
      const result = await dispatch(verifyUserOTP({ email, code }));

      if (verifyUserOTP.fulfilled.match(result)) {
        const token = result.payload?.token;
        const returnedUser = result.payload?.user;

        if (token) {
          dispatch(setToken(token));
          localStorage.setItem('token', token);
        }

        if (returnedUser) {
          dispatch(setUser(returnedUser));
          localStorage.setItem('user', JSON.stringify(returnedUser));
        }

        const userInfoResult = await dispatch(fetchUserInfo(token));
        if (fetchUserInfo.fulfilled.match(userInfoResult)) {
          const fetchedUser = userInfoResult.payload?.user || userInfoResult.payload;
          if (fetchedUser) {
            dispatch(setUser(fetchedUser));
            localStorage.setItem('user', JSON.stringify(fetchedUser));
          }
          navigate('/dashboard');
          return;
        } else {
          const err = userInfoResult.payload?.message || userInfoResult.error?.message || 'Failed to fetch user info';
          setOtpError(err);
          return;
        }
      }

      const message = result.payload?.message || result.error?.message || 'OTP verification failed.';
      setOtpError(message);
    } catch (err) {
      console.error('OTP verify error', err);
      setOtpError('Unexpected error verifying OTP. Try again later.');
    }
  };

  const handleResend = async () => {
    setOtpError(null);
    setInfoMessage(null);

    const email = reduxUser?.email || getCurrentEmail();
    if (!email) { setOtpError('Please enter your email to resend OTP.'); return; }
    if (resendAttempts >= MAX_RESEND_ATTEMPTS) { setOtpError('Max resend attempts reached. Try later.'); return; }
    if (resendCooldown > 0) { setOtpError(`Please wait ${resendCooldown}s before resending.`); return; }

    try {
      const result = await dispatch(resendOTP({ email }));
      if (resendOTP.fulfilled.match(result)) {
        setInfoMessage('A new OTP has been sent to your email.');
        setResendAttempts((a) => a + 1);
        setResendCooldown(COOLDOWN_SECONDS);
      } else {
        const message = result.payload?.message || result.error?.message || 'Failed to resend OTP';
        setOtpError(message);
      }
    } catch (err) {
      console.error('resend otp error', err);
      setOtpError('Unable to resend OTP right now. Try later.');
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mt: 8, mx: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Verify OTP</Typography>

      {/* Show email only when redux doesn't have it */}
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

      {/* Display the known email to the user when available */}
      {reduxUser?.email && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          OTP sent to <strong>{reduxUser.email}</strong>
        </Typography>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="OTP Code"
          name="code"
          inputProps={{ inputMode: 'numeric', maxLength: 6 }}
          fullWidth
          margin="normal"
          {...register('code', { required: 'OTP code is required', pattern: { value: /^[0-9]{4,6}$/, message: 'Enter numeric OTP' } })}
        />

        <Button type="submit" variant="contained" fullWidth disabled={reduxStatus === 'loading'}>
          {reduxStatus === 'loading' ? 'Verifying...' : 'Verify OTP'}
        </Button>
      </form>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2">Didn't get it?</Typography>
        <Box>
          <Button onClick={handleResend} disabled={resendCooldown > 0 || reduxStatus === 'loading' || resendAttempts >= MAX_RESEND_ATTEMPTS}>
            Resend OTP
          </Button>
          {resendCooldown > 0 && <Typography variant="caption" sx={{ ml: 1 }}>({resendCooldown}s)</Typography>}
        </Box>
      </Box>

      {infoMessage && <Alert severity="success" sx={{ mt: 2 }}>{infoMessage}</Alert>}
      {otpError && <Alert severity="error" sx={{ mt: 2 }}>{otpError}</Alert>}

      <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
        If you still have trouble, check your spam folder or contact support.
      </Typography>
    </Box>
  );
};

export default Otp;
