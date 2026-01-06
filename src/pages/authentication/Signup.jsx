import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, setUser } from '../../features/authentication/authenticationSlice';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Alert } from '@mui/material';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const { status } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState(null);

  const onSubmit = async (data) => {
    setLocalError(null);
    const result = await dispatch(signupUser(data));
    const response = result.payload;

    if (signupUser.fulfilled.match(result) && response?.status === true) {
      dispatch(setUser({ email: data.email }));
      navigate('/verify-otp');
      return;
    }

    if (response?.message?.includes('already verified')) {
      setLocalError('User already exists. Please log in.');
      return;
    }

    setLocalError(response?.message || result.error?.message || 'Signup failed');
  };

  return (
    <Box
      sx={{
        maxWidth: 420,
        mx: 'auto',
        px: { xs: 2, sm: 3 },
        mt: { xs: 6, sm: 8 },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          fullWidth
          margin="dense"
          {...register('email', { required: true })}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="dense"
          sx={{ mb: 1 }}
          {...register('password', { required: true })}
        />

        <Button
          variant="contained"
          type="submit"
          fullWidth
          disabled={status === 'loading'}
          sx={{ mt: 2 }}
        >
          {status === 'loading' ? 'Signing up…' : 'Signup'}
        </Button>

        <Button
          variant="text"
          fullWidth
          sx={{ mt: 1 }}
          onClick={() => navigate('/login')}
        >
          Already have an account? Login
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

export default Signup;
