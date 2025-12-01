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
  const { status, error } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState(null);

  const onSubmit = async (data) => {
    setLocalError(null);
    const result = await dispatch(signupUser(data));

    if (signupUser.fulfilled.match(result)) {
      // store the email in redux so OTP page can read it
      dispatch(setUser({ email: data.email }));
      navigate('/verify-otp');
    } else {
      setLocalError(
        result.payload?.message ||
        result.error?.message ||
        'Signup failed'
      );
    }
  };

  const finalError = localError || error;

  return (
    <Box sx={{ maxWidth: 400, mt: 8, mx: 'auto' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          {...register('email', { required: true })}
        />

        <TextField
          label="Password"
          fullWidth
          margin="normal"
          type="password"
          {...register('password', { required: true })}
        />

        <Button variant="contained" type="submit" fullWidth disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing up...' : 'Signup'}
        </Button>

        {finalError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {finalError}
          </Alert>
        )}
      </form>
    </Box>
  );
};

export default Signup;
