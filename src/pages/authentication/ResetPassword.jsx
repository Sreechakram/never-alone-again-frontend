import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../features/authentication/authenticationSlice';
import { Box, Button, TextField, Alert } from '@mui/material';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const { status, error } = useSelector((state) => state.auth);

  const onSubmit = async (data) => {
    // backend expects { email, newPassword } as per original code
    // handle result if needed
  };

  return (
    <Box sx={{ maxWidth: 400, mt: 8, mx: 'auto' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField label="Email" fullWidth margin="normal" {...register('email', { required: true })} />
        <TextField label="New Password" type="password" fullWidth margin="normal" {...register('newPassword', { required: true })} />
        <Button type="submit" variant="contained" fullWidth>
          {status === 'loading' ? 'Updating...' : 'Update Password'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </form>
    </Box>
  );
};

export default ResetPassword;
