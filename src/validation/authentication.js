// validation/authValidation.js
import * as Yup from 'yup';

// Define validation schema using Yup
export const signupValidationSchema = Yup.object({
  username: Yup.string()
    .required('Username is required.')
    .min(3, 'Username must be at least 3 characters long.')
    .max(30, 'Username must be less than 30 characters long.'),
  
  email: Yup.string()
    .email('Invalid email format.')
    .required('Email is required.'),

  password: Yup.string()
    .required('Password is required.')
    .min(6, 'Password must be at least 6 characters long.')
    .max(20, 'Password must be less than 20 characters long.'),
});
