import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import apiClient from '../api/client';
import bgImage from '../assets/dyp.jpeg';
import dypLogo from '../assets/image.png';
import iqacLogo from '../assets/iqac.png';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!token) {
      setError('Password reset token is missing from the link. Please request a new password reset link.');
      return;
    }
    if (!password || password.length < 6) {
      setError('New password must be at least 6 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setError('');
    setIsLoading(true);

    let locationPayload = {};
    try {
      if (navigator.geolocation) {
        const pos = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
            timeout: 5000,
            enableHighAccuracy: true,
          });
        });
        if (pos && pos.coords) {
          locationPayload = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            location: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)} (Accuracy: ±${Math.round(pos.coords.accuracy)}m)`,
          };
        }
      }
    } catch (ignored) {}

    try {
      const res = await apiClient.post('/auth/reset-password', {
        token: token.trim(),
        newPassword: password.trim(),
        ...locationPayload,
      });

      setIsLoading(false);
      setIsSuccess(true);
    } catch (err) {
      setIsLoading(false);
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.customMessage ||
        err?.message ||
        'Unable to reset password. The link may have expired or is invalid.'
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
      {/* Dark gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(10, 16, 30, 0.78) 0%, rgba(15, 23, 42, 0.85) 50%, rgba(6, 11, 25, 0.92) 100%)',
          zIndex: 1,
        }}
      />

      {/* Header Bar */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '24px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={dypLogo}
            alt="DYPIU"
            style={{ height: '48px', objectFit: 'contain' }}
          />
          <div style={{ height: '32px', width: '1px', background: 'rgba(255, 255, 255, 0.2)' }} />
          <div>
            <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '15px', letterSpacing: '-0.01em' }}>
              D. Y. Patil International University
            </div>
            <div style={{ color: '#94a3b8', fontSize: '11.5px', fontWeight: '500' }}>
              Outcome-Based Education (OBE) Portal
            </div>
          </div>
        </div>
        <img
          src={iqacLogo}
          alt="IQAC"
          style={{ height: '42px', objectFit: 'contain' }}
        />
      </header>

      {/* Main Container */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            background: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '36px 32px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
            boxSizing: 'border-box',
          }}
        >
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 20px',
                  color: '#10b981',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ margin: '0 0 8px', color: '#ffffff', fontSize: '20px', fontWeight: '800' }}>
                Password Reset Successful
              </h2>
              <p style={{ margin: '0 0 28px', color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.5 }}>
                Your account password has been updated. All prior active sessions have been terminated for security.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                }}
              >
                Proceed to Login
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
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
                <div>
                  <h2 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.01em' }}>
                    Reset Password
                  </h2>
                </div>
              </div>
              <p style={{ margin: '0 0 24px', color: '#94a3b8', fontSize: '13px', lineHeight: 1.5 }}>
                Enter your new credentials below to securely restore access to your account.
              </p>

              {/* Error Box */}
              {error && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    marginBottom: '20px',
                  }}
                >
                  <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: '#fca5a5', fontSize: '12.5px', lineHeight: 1.4 }}>{error}</span>
                </div>
              )}

              {!token ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <p style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '20px' }}>
                    No reset token found in the URL. Please click the link directly from your email.
                  </p>
                  <Link
                    to="/login"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#818cf8',
                      fontSize: '13px',
                      fontWeight: '600',
                      textDecoration: 'none',
                    }}
                  >
                    <ArrowLeft size={14} /> Back to Login
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* New Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          padding: '11px 40px 11px 38px',
                          background: 'rgba(30, 41, 59, 0.7)',
                          border: '1px solid rgba(148, 163, 184, 0.25)',
                          borderRadius: '10px',
                          color: '#ffffff',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                      Confirm New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                        <Lock size={16} />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          padding: '11px 40px 11px 38px',
                          background: 'rgba(30, 41, 59, 0.7)',
                          border: '1px solid rgba(148, 163, 184, 0.25)',
                          borderRadius: '10px',
                          color: '#ffffff',
                          fontSize: '13.5px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      marginTop: '8px',
                      width: '100%',
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                      border: '1px solid rgba(129, 140, 248, 0.3)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(79, 70, 229, 0.35)',
                      opacity: isLoading ? 0.75 : 1,
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      'Save New Password'
                    )}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '6px' }}>
                    <Link
                      to="/login"
                      style={{
                        color: '#94a3b8',
                        fontSize: '12px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ArrowLeft size={12} /> Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

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
        © {new Date().getFullYear()} DYPIU • Internal Quality Assurance Cell (IQAC)
      </footer>
    </div>
  );
}
