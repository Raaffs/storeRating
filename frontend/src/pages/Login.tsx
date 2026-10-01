import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { loginSchema } from '../utils/validation';
import * as yup from 'yup';

import api from '../api/client';

type LoginFormData = yup.InferType<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = React.useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMsg('');
      const res = await api.post('/auth/login', data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (res.data.user.role === 'STORE_OWNER') {
        navigate('/owner');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>
        
        {errorMsg && <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: 12, borderRadius: 8, marginBottom: 20, textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}>{errorMsg}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
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
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', top: 14, left: 14, color: 'var(--text-light)' }} />
              <input
                {...register('password')}
                type="password"
                className="form-control"
                style={{ paddingLeft: 42 }}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 10 }} disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/signup" style={{ fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
