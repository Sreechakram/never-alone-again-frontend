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
  const { token, verified } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            token && verified ? <Dashboard /> : <Navigate to="/verify-otp" />
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
