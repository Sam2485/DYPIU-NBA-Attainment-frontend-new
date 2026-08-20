import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
} from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTabRole, setActiveTabRole] = useState(null);

  // If already logged in, redirect to dashboard or appropriate landing page
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
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      setIsLoading(false);
      if (result && result.success) {
        navigate(result.targetPath, { replace: true });
      } else {
        setError(result?.error || 'Authentication failed');
      }
    } catch (err) {
      setIsLoading(false);
      setError(err?.response?.data?.message || err?.message || 'Authentication failed');
    }
  };

  const handleSelectDemoRole = (roleKey, roleEmail) => {
    setActiveTabRole(roleKey);
    setEmail(roleEmail);
    setPassword('123456');
    setError('');
  };

  const demoRoles = [
    {
      key: 'DIRECTOR',
      title: 'Director',
      email: 'director@dypiu.ac.in',
      badge: 'Institution Head',
      desc: 'School Level Approvals & Governance',
      color: '#3b82f6',
      bgLight: 'rgba(59, 130, 246, 0.08)',
      border: 'rgba(59, 130, 246, 0.25)',
    },
    {
      key: 'HOD',
      title: 'HOD',
      email: 'hod@dypiu.ac.in',
      badge: 'Department Head',
      desc: 'Batch & Programme Setup Workflow',
      color: '#10b981',
      bgLight: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    {
      key: 'PROGRAMME_COORDINATOR',
      title: 'Programme Coordinator',
      email: 'pc@dypiu.ac.in',
      badge: 'Programme Lead',
      desc: 'PO Target Setting & Reviews',
      color: '#8b5cf6',
      bgLight: 'rgba(139, 92, 246, 0.08)',
      border: 'rgba(139, 92, 246, 0.25)',
    },
    {
      key: 'FACULTY',
      title: 'Course Coordinator',
      email: 'cc@dypiu.ac.in',
      badge: 'Faculty / CC',
      desc: 'Course Outcomes, Mapping & Attainment',
      color: '#f59e0b',
      bgLight: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.25)',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 65%, #080d1a 100%)',
        padding: '24px 16px',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient lighting accents */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '20%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '15%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '1020px',
          background: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left Side: Brand & Feature Highlights */}
        <div
          style={{
            padding: '44px 40px',
            background: 'linear-gradient(175deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderRight: '1px solid rgba(148, 163, 184, 0.14)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            {/* Header Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  boxShadow: '0 10px 25px rgba(37,99,235,0.4)',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: 17,
                  display: 'grid',
                  placeItems: 'center',
                  letterSpacing: '0.04em',
                }}
              >
                NBA
              </div>
              <div>
                <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  NBA Attainment System
                </div>
                <div style={{ color: '#94a3b8', fontSize: 12.5, fontWeight: 500 }}>
                  D. Y. Patil International University
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.28)',
                  color: '#60a5fa',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 14,
                }}
              >
                <Sparkles size={13} />
                Accreditation & OBE Suite
              </span>
              <h2
                style={{
                  color: '#f8fafc',
                  fontSize: '24px',
                  fontWeight: 800,
                  lineHeight: 1.3,
                  margin: '0 0 10px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Direct & Indirect Outcome-Based Attainment Engine
              </h2>
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: '13.5px',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Streamlined calculation, multi-level departmental review, and automated Action Taken Reports (ATR) for NBA accreditation compliance.
              </p>
            </div>

            {/* Feature Checkpoints */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                {
                  icon: <ShieldCheck size={17} color="#38bdf8" />,
                  title: 'Multi-Tier Role Hierarchy',
                  desc: 'Director, HOD, Programme Coordinator & Course Coordinator workflows.',
                },
                {
                  icon: <Layers size={17} color="#4ade80" />,
                  title: 'Automated CO-PO-PSO Computation',
                  desc: 'Direct CIE/SEE marks integration + indirect surveys calculation.',
                },
                {
                  icon: <Award size={17} color="#fbbf24" />,
                  title: 'Continuous Quality Improvement (CQI)',
                  desc: 'Export-ready Course ATRs and Year-Wise Programme ATR summaries.',
                },
              ].map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                  }}
                >
                  <div style={{ marginTop: 2, flexShrink: 0 }}>{feat.icon}</div>
                  <div>
                    <div style={{ color: '#f1f5f9', fontSize: 12.5, fontWeight: 700, lineHeight: 1.3 }}>
                      {feat.title}
                    </div>
                    <div style={{ color: '#8292ad', fontSize: 11.5, lineHeight: 1.4, marginTop: 2 }}>
                      {feat.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              paddingTop: 24,
              borderTop: '1px solid rgba(148, 163, 184, 0.12)',
              marginTop: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#64748b',
              fontSize: '11px',
            }}
          >
            <span>NBA Portal • Akurdi, Pune</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>v2.5 Production Build</span>
          </div>
        </div>

        {/* Right Side: Sign In Form & Quick Demo Roles */}
        <div
          style={{
            padding: '44px 38px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                color: '#f8fafc',
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: '0 0 6px 0',
              }}
            >
              Sign In
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
              Access your institutional attainment workspace
            </p>
          </div>

          {/* Quick Demo Role Fillers */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  color: '#38bdf8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}
              >
                Quick Demo Access (1-Click Fill)
              </span>
              <span style={{ fontSize: '10.5px', color: '#64748b' }}>Pass: 123456</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8,
              }}
            >
              {demoRoles.map((r) => {
                const isSelected = email === r.email;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => handleSelectDemoRole(r.key, r.email)}
                    style={{
                      background: isSelected ? r.bgLight : 'rgba(30, 41, 59, 0.55)',
                      border: `1px solid ${isSelected ? r.color : 'rgba(148, 163, 184, 0.16)'}`,
                      borderRadius: '10px',
                      padding: '8px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: isSelected ? r.color : '#f1f5f9',
                        }}
                      >
                        {r.title}
                      </span>
                      {isSelected && <CheckCircle2 size={12} color={r.color} />}
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#64748b',
                        marginTop: 2,
                        fontFamily: 'monospace',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.email}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                style={{
                  display: 'block',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Institutional Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. director@gmail.com, hod@gmail.com"
                  required
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px 0 38px',
                    borderRadius: '10px',
                    border: '1px solid rgba(148, 163, 184, 0.22)',
                    background: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '13px',
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(148, 163, 184, 0.22)')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label
                  htmlFor="login-password"
                  style={{
                    color: '#cbd5e1',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  Password
                </label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Default: 123456</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 40px 0 38px',
                    borderRadius: '10px',
                    border: '1px solid rgba(148, 163, 184, 0.22)',
                    background: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '13px',
                    fontWeight: 500,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(148, 163, 184, 0.22)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: 6,
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                opacity: isLoading ? 0.8 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Institutional Note */}
          <div
            style={{
              marginTop: 20,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(30, 41, 59, 0.35)',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              fontSize: '11px',
              color: '#8292ad',
              lineHeight: 1.4,
              textAlign: 'center',
            }}
          >
            🔒 Single Sign-On simulation enabled for NBA Accreditation workflows.
          </div>
        </div>
      </div>
    </div>
  );
}
