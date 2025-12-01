import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../features/authentication/authenticationSlice';
import { Box, Button, TextField, Alert } from '@mui/material';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const { status, error } = useSelector((state) => state.auth);

  const onSubmit = async (data) => {
    // thunk expects an object like { email }
    const result = await dispatch(forgotPassword({ email: data.email }));
    // optionally handle success/failure here
    // e.g. show a success message or route
  };

  return (
    <Box sx={{ maxWidth: 400, mt: 8, mx: 'auto' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField label="Email" fullWidth margin="normal" {...register('email', { required: true })} />
        <Button type="submit" variant="contained" fullWidth>
          {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </form>
    </Box>
  );
};

export default ForgotPassword;
