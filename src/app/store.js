import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authentication/authenticationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
