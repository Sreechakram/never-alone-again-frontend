import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearError } from '../../features/authentication/authenticationSlice';
import { Box, Button, TextField, Alert, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email;

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { email: emailFromState || '' }
  });

  const { status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!emailFromState) navigate('/forgot-password');
    return () => dispatch(clearError());
  }, [dispatch, emailFromState, navigate]);

  const onSubmit = async (data) => {
    const action = await dispatch(resetPassword(data));
    if (resetPassword.fulfilled.match(action)) {
      navigate('/login', {
        state: { message: 'Password reset successful. Please login.' }
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h6" mb={2}>Reset Password</Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          disabled
          {...register('email')}
        />

        <TextField
          label="OTP"
          fullWidth
          margin="normal"
          error={!!errors.code}
          helperText={errors.code?.message}
          {...register('code', { required: 'OTP is required' })}
        />

        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />

        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Confirm your password',
            validate: (value) =>
              value === watch('password') || 'Passwords do not match'
          })}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={status === 'loading'}
          sx={{ mt: 2 }}
        >
          {status === 'loading' ? 'Resetting...' : 'Reset Password'}
        </Button>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </form>
    </Box>
  );
};

export default ResetPassword;
