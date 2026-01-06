import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../features/authentication/authenticationSlice';
import { Box, Button, TextField, Alert } from '@mui/material';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const { status } = useSelector((state) => state.auth);

  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const onSubmit = async (data) => {
    setLocalError(null);
    setSuccessMsg(null);

    const result = await dispatch(resetPassword(data));
    const response = result.payload;
    if (resetPassword.fulfilled.match(result) && response?.status === true) {
      setSuccessMsg(response.message || "Password updated successfully.");
      return;
    }
    
    // ERROR
    setLocalError(
      response?.message ||
      result.error?.message ||
      "Failed to update password."
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
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          {...register('newPassword', { required: true })}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Updating...' : 'Update Password'}
        </Button>

        {successMsg && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {successMsg}
          </Alert>
        )}

        {localError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {localError}
          </Alert>
        )}
      </form>
    </Box>
  );
};

export default ResetPassword;
