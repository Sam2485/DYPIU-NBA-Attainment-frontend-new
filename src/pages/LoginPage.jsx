import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, KeyRound, CheckCircle2, X, MapPin, ShieldAlert } from 'lucide-react';
import apiClient from '../api/client';

import bgImage from '../assets/dyp.jpeg';
import dypLogo from '../assets/image.png';
import iqacLogo from '../assets/iqac.png';

export default function LoginPage() {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatusText, setForgotStatusText] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // If already authenticated, redirect to appropriate role dashboard
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'IQAC') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'DIRECTOR') {
        navigate('/director/dashboard', { replace: true });
      } else if (role === 'HOD') {
        navigate('/hod/dashboard', { replace: true });
      } else if (role === 'PROGRAMME_COORDINATOR') {
        navigate('/programme-coordinator/dashboard', { replace: true });
      } else if (role === 'FACULTY' || role === 'COURSE_COORDINATOR') {
        navigate('/course-coordinator/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

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

  const getUserGeolocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser. Location verification is mandatory to initiate a password reset.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const acc = position.coords.accuracy;
          resolve({
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            location: `${lat.toFixed(6)}, ${lng.toFixed(6)} (Accuracy: ±${Math.round(acc)}m)`,
          });
        },
        (error) => {
          let msg = 'Location permission is required for security verification before initiating password reset.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission was denied. You MUST allow browser location access to initiate a password reset as per institutional security policy.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location information is unavailable. Please ensure location services are enabled on your device.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out. Please check your network and GPS settings and try again.';
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
    });
  };

  const handleForgotPassword = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered institutional email address.');
      return;
    }

    setForgotError('');
    setForgotMessage('');
    setForgotLoading(true);
    setForgotStatusText('Verifying browser location & security permissions...');

    try {
      // 1. Mandatory Geolocation Verification
      let geo = userLocation;
      if (!geo) {
        geo = await getUserGeolocation();
        setUserLocation(geo);
      }

      setForgotStatusText('Dispatching secure reset email...');
      const res = await apiClient.post('/auth/forgot-password', {
        email: forgotEmail.trim(),
        latitude: geo.latitude,
        longitude: geo.longitude,
        accuracy: geo.accuracy,
        location: geo.location,
      });

      setForgotLoading(false);
      setForgotStatusText('');
      setForgotMessage(
        res?.data?.message ||
        res?.data ||
        'If an account with that email exists, a password reset link has been dispatched to your inbox.'
      );
    } catch (err) {
      setForgotLoading(false);
      setForgotStatusText('');
      setForgotError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.customMessage ||
        err?.message ||
        'Unable to process password reset request. Please check location permissions and try again.'
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
          backdropFilter: 'blur(0px)',
          WebkitBackdropFilter: 'blur(0px)',
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
          }}
        >
          <img
            src={dypLogo}
            alt="DYPIU Logo"
            style={{
              height: '125px',
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
          }}
        >
          <img
            src={iqacLogo}
            alt="IQAC Logo"
            style={{
              height: '125px',
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
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label
                  htmlFor="password-input"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#cbd5e1',
                    margin: 0,
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotError('');
                    setForgotMessage('');
                    setForgotEmail(email || '');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#a5b4fc')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#818cf8')}
                >
                  Forgot password?
                </button>
              </div>
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowForgotModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '18px',
              padding: '28px 26px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(79, 70, 229, 0.2)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#818cf8',
                }}
              >
                <KeyRound size={18} />
              </div>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: '800' }}>
                Reset Your Password
              </h3>
            </div>

            <p style={{ margin: '0 0 20px', color: '#94a3b8', fontSize: '13px', lineHeight: 1.5 }}>
              Enter your registered institutional email. We will dispatch a secure, single-use password reset link.
            </p>

            {forgotError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={15} style={{ color: '#f87171', flexShrink: 0 }} />
                <span style={{ color: '#fca5a5', fontSize: '12px' }}>{forgotError}</span>
              </div>
            )}

            {forgotMessage ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 14px',
                    color: '#10b981',
                  }}
                >
                  <CheckCircle2 size={26} />
                </div>
                <h4 style={{ margin: '0 0 8px', color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>
                  Reset Link Dispatched
                </h4>
                <p style={{ margin: '0 0 20px', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5 }}>
                  {forgotMessage}
                </p>
                <p style={{ margin: '0 0 20px', color: '#94a3b8', fontSize: '11.5px' }}>
                  Please check your inbox (and spam/junk folder). The link will expire in 15 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  style={{
                    width: '100%',
                    padding: '11px 18px',
                    background: '#4f46e5',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. user@dypiu.ac.in"
                      required
                      disabled={forgotLoading}
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 38px',
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(148, 163, 184, 0.25)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Institutional Security Notice: Mandatory Geolocation & IP */}
                <div
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(96, 165, 250, 0.25)',
                    borderRadius: '10px',
                    padding: '11px 13px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#93c5fd', fontSize: '12px', fontWeight: '700' }}>
                    <MapPin size={14} style={{ color: '#60a5fa', flexShrink: 0 }} />
                    <span>Mandatory Security Verification</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.45 }}>
                    Institutional policy requires client geolocation & IP capture for every password reset. If location access is denied or disabled, the reset request is restricted.
                  </p>
                  {userLocation && (
                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#34d399', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} />
                      <span>GPS Coordinates Acquired: {userLocation.location}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    disabled={forgotLoading}
                    style={{
                      flex: 1,
                      padding: '11px 16px',
                      background: 'rgba(51, 65, 85, 0.6)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '10px',
                      color: '#cbd5e1',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      flex: 1.6,
                      padding: '11px 16px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                      border: '1px solid rgba(129, 140, 248, 0.3)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: forgotLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      opacity: forgotLoading ? 0.75 : 1,
                    }}
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>{forgotStatusText || 'Verifying Location...'}</span>
                      </>
                    ) : (
                      'Verify & Send Reset Link'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
