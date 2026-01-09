import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearError } from '../../features/authentication/authenticationSlice';
import { Box, Button, TextField, Alert, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async ({ email }) => {
    const action = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(action)) {
      navigate('/reset-password', { state: { email } });
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h6" mb={2}>Forgot Password</Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Sending OTP...' : 'Send OTP'}
        </Button>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </form>
    </Box>
  );
};

export default ForgotPassword;
