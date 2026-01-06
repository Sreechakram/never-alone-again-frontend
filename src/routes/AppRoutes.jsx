import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from '../pages/authentication/Signup';
import Login from '../pages/authentication/Login';
import VerifyOtp from '../pages/authentication/VerifyOtp';
import Dashboard from '../pages/dashboard/Dashboard';
import ForgotPassword from '../pages/authentication/ForgotPassword';
import ResetPassword from '../pages/authentication/ResetPassword';
import { useSelector } from 'react-redux';

const AppRoutes = () => {
  const { token, verified, user } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/signup" replace />} />

        {/* Public routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* OTP route (only if user exists but not verified) */}
        <Route
          path="/verify-otp"
          element={
            user && !verified
              ? <VerifyOtp />
              : <Navigate to="/signup" replace />
          }
        />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            !token
              ? <Navigate to="/signup" replace />
              : !verified
                ? <Navigate to="/verify-otp" replace />
                : <Dashboard />
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
