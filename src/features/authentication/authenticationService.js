// src/features/authentication/authenticationService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const signup = (data) => axios.post(`${API_URL}/user/signup`, data);
// export const login = (data) => axios.post(`${API_URL}/user/login`, data);
export const login = (data) =>axios.post(`${API_URL}/user/login`, data);

export const verifyOTP = (data) => axios.post(`${API_URL}/user/verify-otp`, data);

// <-- newly added resendOTP
export const resendOTP = (data) => axios.post(`${API_URL}/user/resend-otp`, data);

export const getUserInfo = (token) =>
  axios.get(`${API_URL}/user/info`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const forgotPassword = (data) =>
  axios.post(`${API_URL}/user/forgot-password`, data);

export const resetPassword = (data) =>
  axios.post(`${API_URL}/user/updatePassword`, data);

export const updateUser = (data, token) =>
  axios.post(`${API_URL}/user/update`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
