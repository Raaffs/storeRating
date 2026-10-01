import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Lock } from 'lucide-react';
import { signupSchema } from '../utils/validation';
import * as yup from 'yup';

import api from '../api/client';

type SignupFormData = yup.InferType<typeof signupSchema>;

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = React.useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setErrorMsg('');
      const payload = { ...data, role: data.isStoreOwner ? 'STORE_OWNER' : 'USER' };
      await api.post('/auth/signup', payload);
      navigate('/login');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="auth-wrapper" style={{ padding: '40px 20px' }}>
      <div className="card auth-card" style={{ maxWidth: 500 }}>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join us and start rating your favorite stores</p>

        {errorMsg && <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: 12, borderRadius: 8, marginBottom: 20, textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}>{errorMsg}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-light)' }} />
              <input
                {...register('name')}
                className="form-control"
                style={{ paddingLeft: 42 }}
                placeholder="Minimum 20 characters..."
              />
            </div>
            {errors.name && <span className="error-text">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-light)' }} />
              <input
                {...register('email')}
                className="form-control"
                style={{ paddingLeft: 42 }}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-light)' }} />
              <textarea
                {...register('address')}
                className="form-control"
                style={{ paddingLeft: 42, minHeight: 80, paddingTop: 12, resize: 'none' }}
                placeholder="Your full address..."
              />
            </div>
            {errors.address && <span className="error-text">{errors.address.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-light)' }} />
              <input
                {...register('password')}
                type="password"
                className="form-control"
                style={{ paddingLeft: 42 }}
                placeholder="8-16 chars, 1 uppercase, 1 special"
              />
            </div>
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <input type="checkbox" id="storeOwnerCheck" {...register('isStoreOwner')} style={{ marginRight: 8, width: 16, height: 16 }} />
            <label htmlFor="storeOwnerCheck" style={{ fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer' }}>Register as Store Owner</label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 10 }} disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
