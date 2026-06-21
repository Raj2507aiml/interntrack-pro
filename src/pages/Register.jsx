import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, User, Mail, Lock, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getFriendlyErrorMessage = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.';
      case 'auth/invalid-email':
        return 'The email address is badly formatted.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/weak-password':
        return 'The password is too weak. Must be at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network connection lost. Please check your internet connection.';
      default:
        return 'An error occurred during registration. Please try again.';
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!displayName.trim()) {
      tempErrors.displayName = 'Full Name is required';
    }
    
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
    
    if (!confirmPassword) {
      tempErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      await register(email, password, displayName);
      showToast('Account created successfully! Welcome to InternTrack Pro.', 'success');
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
            Create an account to start tracking your applications
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

          <form onSubmit={handleSubmit}>
            
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">Full Name</label>
              <div className="auth-input-container">
                <User size={16} className="auth-input-icon" />
                <input
                  id="register-name"
                  type="text"
                  className="form-input auth-input"
                  placeholder="Raj Gupta"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
              {errors.displayName && <span className="form-error">{errors.displayName}</span>}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Email Address</label>
              <div className="auth-input-container">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="register-email"
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

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password</label>
              <div className="auth-input-container">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="register-password"
                  type="password"
                  className="form-input auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="register-confirm">Confirm Password</label>
              <div className="auth-input-container">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="register-confirm"
                  type="password"
                  className="form-input auth-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Sign Up</span>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="auth-card-footer">
            <span>Already have an account? </span>
            <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
