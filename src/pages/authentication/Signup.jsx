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

    // console.log("Response:", response);

    // SUCCESS -> new user OR unverified user -> move to OTP
    if (signupUser.fulfilled.match(result) && response?.status === true) {
      dispatch(setUser({ email: data.email }));
      navigate("/verify-otp");
      return;
    }

    // USER ALREADY VERIFIED -> just show message, DO NOT redirect
    if (response?.message?.includes("already verified")) {
      setLocalError("User already exists. Please log in.");
      return;
    }

    // Any other error
    setLocalError(
      response?.message ||
      result.error?.message ||
      "Signup failed"
    );
  };

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
          type="password"
          fullWidth
          margin="normal"
          {...register('password', { required: true })}
        />

        <Button
          variant="contained"
          type="submit"
          fullWidth
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Signing up...' : 'Signup'}
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
