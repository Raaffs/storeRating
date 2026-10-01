import * as yup from 'yup';

export const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{8,16}$/;

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const signupSchema = yup.object().shape({
  name: yup
    .string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must be at most 60 characters')
    .required('Name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  address: yup
    .string()
    .max(400, 'Address must be at most 400 characters')
    .required('Address is required'),
  password: yup
    .string()
    .matches(
      passwordRegex,
      'Password must be 8-16 characters, contain at least one uppercase letter, and one special character'
    )
    .required('Password is required'),
  isStoreOwner: yup.boolean(),
});
