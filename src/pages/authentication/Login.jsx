// src/components/Login.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../features/authentication/authenticationSlice';
import { Box, Button, TextField, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const { status, error } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState(null);

  const onSubmit = async (data) => {
    setLocalError(null);
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      // backend may require OTP flow next; navigate to verify OTP
      navigate('/verify-otp');
    } else {
      setLocalError(result.payload?.message || result.error?.message || 'Login failed');
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mt: 8, mx: 'auto' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField label="Email" fullWidth margin="normal" {...register('email', { required: true })} />
        <TextField label="Password" type="password" fullWidth margin="normal" {...register('password', { required: true })} />
        <Button type="submit" variant="contained" fullWidth disabled={status === 'loading'}>
          {status === 'loading' ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      {(localError || error) && <Alert severity="error" sx={{ mt: 2 }}>{localError || error}</Alert>}
    </Box>
  );
};

export default Login;
