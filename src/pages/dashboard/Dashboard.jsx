// src/components/Dashboard.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo, logout } from '../../features/authentication/authenticationSlice';
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchUserInfo(token));
    } else {
      navigate('/signup');
    }
  }, [dispatch, token, navigate]);

  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h5">Welcome to Dashboard</Typography>
      <Typography sx={{ mt: 2 }}>{user?.userName}</Typography>
      <Typography sx={{ mt: 1, color: 'text.secondary' }}>
        Role: {user?.Role?.roleName}
      </Typography>
      <Button sx={{ mt: 3 }} variant="outlined" onClick={() => { dispatch(logout()); navigate('/signup'); }}>
        Logout
      </Button>
    </Box>
  );
};

export default Dashboard;
