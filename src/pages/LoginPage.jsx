import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

import bgImage from '../assets/dyp.jpeg';
import dypLogo from '../assets/image.png';
import iqacLogo from '../assets/iqac.png';

export default function LoginPage() {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to appropriate role dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname;
      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else if (role === 'DIRECTOR') {
        navigate('/director/dashboard', { replace: true });
      } else if (role === 'HOD') {
        navigate('/hod/dashboard', { replace: true });
      } else if (role === 'PROGRAMME_COORDINATOR') {
        navigate('/programme-coordinator/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate, location]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your institutional email or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await login(email.trim(), password);
      setIsLoading(false);
      if (result && result.success) {
        navigate(result.targetPath || '/dashboard', { replace: true });
      } else {
        setError(result?.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setIsLoading(false);
      setError(
        err?.customMessage ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Authentication failed. Please verify your credentials and try again.'
      );
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundImage: 'url(' + bgImage + ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        boxSizing: 'border-box',
        overflow: 'auto',
      }}
    >
      {/* Dark gradient overlay for high contrast and readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(10, 16, 30, 0.78) 0%, rgba(15, 23, 42, 0.85) 50%, rgba(6, 11, 25, 0.92) 100%)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 1,
        }}
      />

      {/* Top Navigation Bar: Top-Left DYPIU Logo & Top-Right IQAC Logo */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 36px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Top-Left Logo (DYPIU) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: 'rgba(255, 255, 255, 0.94)',
            padding: '8px 18px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <img
            src={dypLogo}
            alt="DYPIU Logo"
            style={{
              height: '48px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* Top-Right Logo (IQAC) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: 'rgba(255, 255, 255, 0.94)',
            padding: '8px 18px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <img
            src={iqacLogo}
            alt="IQAC Logo"
            style={{
              height: '48px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      </header>

      {/* Middle Content Area: Centered Glass Login Card */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: '24px 20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            background: 'rgba(15, 23, 42, 0.68)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '24px',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            padding: '40px 36px',
            boxSizing: 'border-box',
            color: '#f8fafc',
          }}
        >
          {/* Card Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(59, 130, 246, 0.16)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                color: '#93c5fd',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              OBE & NBA Attainment Portal
            </div>

            <h1
              style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#ffffff',
                margin: '0 0 8px 0',
                letterSpacing: '-0.02em',
              }}
            >
              Sign In
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: '#94a3b8',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Enter your institutional credentials to access your academic dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(248, 113, 113, 0.35)',
                color: '#fca5a5',
                fontSize: '13px',
                lineHeight: 1.4,
                marginBottom: '24px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#f87171' }} />
              <div>{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email / Username Input */}
            <div>
              <label
                htmlFor="email-input"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#cbd5e1',
                  marginBottom: '8px',
                }}
              >
                Institutional Email or Username
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Mail size={18} />
                </div>
                <input
                  id="email-input"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@dypiu.ac.in"
                  disabled={isLoading}
                  autoComplete="username"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.25)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password-input"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#cbd5e1',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Lock size={18} />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.25)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '13px 20px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '600',
                letterSpacing: '0.01em',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.75 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.35)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Institutional note */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                color: '#64748b',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              D. Y. Patil International University, Akurdi, Pune
              <br />
              <span style={{ color: '#475569', fontSize: '11px' }}>
                Accredited Institutional OBE Framework
              </span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '16px 20px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '12px',
        }}
      >
        © {new Date().getFullYear()} DYPIU. All rights reserved. • Internal Quality Assurance Cell (IQAC)
      </footer>

      {/* Global Inline Keyframe for Spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
