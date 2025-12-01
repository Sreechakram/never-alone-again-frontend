import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo } from '../../features/authentication/authenticationSlice';
import Dashboard from '../../pages/dashboard/Dashboard';
import SignupPage from '../../pages/authentication/Signup';
import OTPPage from '../../pages/authentication/Otp';

const Authenticator = () => {
  const dispatch = useDispatch();
  const { token, user, verified } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUserInfo(token));
    }
  }, [token, user, dispatch]);

  if (!token) return <SignupPage />;
  if (!verified) return <OTPPage />;
  return <Dashboard />;
};

export default Authenticator;
