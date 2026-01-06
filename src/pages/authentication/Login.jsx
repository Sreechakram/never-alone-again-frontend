import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser,
  setUser,
  setToken,
} from '../../features/authentication/authenticationSlice';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Alert } from '@mui/material';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { status } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState(null);

  const onSubmit = async ({ email, password }) => {
  setLocalError(null);

  const action = await dispatch(loginUser({ email, password }));

  if (loginUser.fulfilled.match(action)) {
    const res = action.payload;

    if (res?.status === true && res?.token) {
      dispatch(setToken(res.token));
      dispatch(setUser({ email }));
      navigate('/dashboard', { replace: true });
      return;
    }
  }

  if (loginUser.rejected.match(action)) {
    setLocalError(action.payload?.message || 'Invalid email or password');
  }
};


  return (
    <Box sx={{ maxWidth: 400, mt: 8, mx: 'auto' }}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>

        <TextField
          label="Email"
          fullWidth
          margin="normal"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Enter a valid email',
            },
          })}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
          })}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={status === 'loading'}
          sx={{ mt: 2 }}
        >
          {status === 'loading' ? 'Logging in…' : 'Login'}
        </Button>

        {localError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {localError}
          </Alert>
        )}

      </form>
    </Box>
  );
};

export default Login;
