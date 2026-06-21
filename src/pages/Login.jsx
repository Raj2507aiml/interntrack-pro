import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { login, resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Mode state: 'login' or 'forgot'
  const [mode, setMode] = useState('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Helper to translate Firebase Auth error codes to user-friendly messages
  const getFriendlyErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'The email address is badly formatted.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please verify your credentials.';
      case 'auth/too-many-requests':
        return 'Too many login attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network connection lost. Please check your internet connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const validateLoginForm = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateForgotForm = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setLoading(true);
    setErrors({});
    try {
      await login(email, password, rememberMe);
      showToast('Welcome back! Logged in successfully.', 'success');
      navigate('/');
    } catch (error) {
      console.error(error);
      const friendlyMsg = getFriendlyErrorMessage(error.code);
      setErrors({ auth: friendlyMsg });
      showToast(friendlyMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!validateForgotForm()) return;

    setLoading(true);
    setErrors({});
    try {
      await resetPassword(email);
      showToast('Password reset email sent! Check your inbox.', 'success', 6000);
      setMode('login');
    } catch (error) {
      console.error(error);
      const friendlyMsg = getFriendlyErrorMessage(error.code);
      setErrors({ auth: friendlyMsg });
      showToast(friendlyMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--background) 0%, var(--surface-border) 100%);
          padding: 1.5rem;
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
          backdrop-filter: blur(16px);
          background-color: var(--glass-bg);
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-xl);
        }
        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }
        .auth-subtitle {
          color: var(--text-secondary);
          font-size: 0.875rem;
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-input-container {
          position: relative;
        }
        .auth-input-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .auth-input {
          padding-left: 2.5rem;
        }
        .auth-card-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      `}</style>

      <div className="auth-container">
        <div className="card auth-card animate-fade-in">
          
          {/* Logo Header */}
          <div className="auth-logo">
            <GraduationCap size={36} />
            <span>InternTrack Pro</span>
          </div>
          
          <div className="auth-subtitle">
            {mode === 'login' 
              ? 'Manage and track your career application process' 
              : 'Enter email to receive password reset link'}
          </div>

          {errors.auth && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger-hover)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              border: '1px solid rgba(239, 68, 68, 0.15)'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errors.auth}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email Address</label>
                <div className="auth-input-container">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    className="form-input auth-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot'); setErrors({}); }}
                    className="text-xs font-semibold"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="auth-input-container">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="login-password"
                    type="password"
                    className="form-input auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span>Remember Me</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleResetSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="reset-email">Email Address</label>
                <div className="auth-input-container">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    id="reset-email"
                    type="email"
                    className="form-input auth-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Email</span>
                )}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.75rem', display: 'flex', gap: '0.5rem' }}
                onClick={() => { setMode('login'); setErrors({}); }}
                disabled={loading}
              >
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </button>
            </form>
          )}

          {/* Footer Navigation */}
          {mode === 'login' && (
            <div className="auth-card-footer">
              <span>Don't have an account? </span>
              <Link to="/register" style={{ fontWeight: 600 }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
