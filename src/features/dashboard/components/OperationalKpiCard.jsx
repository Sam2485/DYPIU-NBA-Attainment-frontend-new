import React from 'react';
import useCountUp from '../hooks/useCountUp';

export default function OperationalKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = '#4f46e5',
  iconBg = '#eef2ff',
  badgeText,
  badgeType = 'neutral', // 'neutral' | 'success' | 'warning' | 'danger'
  onClick,
  animationDelay = 0,
  isLoading = false,
}) {
  const animatedValue = useCountUp(value, 650);

  const badgeColors = {
    neutral: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
    success: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
    warning: { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
    danger: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  }[badgeType] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

  if (isLoading) {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '18px 20px',
          minHeight: 120,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          animation: 'pulse 1.8s infinite',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '40%', height: 14, background: '#f1f5f9', borderRadius: 4 }} />
          <div style={{ width: 32, height: 32, background: '#f1f5f9', borderRadius: 8 }} />
        </div>
        <div style={{ width: '60%', height: 28, background: '#f1f5f9', borderRadius: 6, margin: '8px 0' }} />
        <div style={{ width: '50%', height: 12, background: '#f1f5f9', borderRadius: 4 }} />
      </div>
    );
  }

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        position: 'relative',
        minHeight: 120,
        opacity: 0,
        animation: `cardEntrance 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards ${animationDelay}ms`,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.07)';
          e.currentTarget.style.borderColor = '#cbd5e1';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.03)';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }
      }}
    >
      {/* Top Row: Title & Icon / Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#64748b',
          }}
        >
          {title}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {badgeText && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 999,
                background: badgeColors.bg,
                color: badgeColors.color,
                border: `1px solid ${badgeColors.border}`,
              }}
            >
              {badgeText}
            </span>
          )}
          {Icon && (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: iconBg,
                display: 'grid',
                placeItems: 'center',
                color: iconColor,
                flexShrink: 0,
              }}
            >
              <Icon size={16} color={iconColor} />
            </div>
          )}
        </div>
      </div>

      {/* Middle Row: Animated Numerical Dominant Value */}
      <div style={{ marginTop: 8, marginBottom: 4 }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          {Number.isFinite(Number(value)) ? animatedValue.toLocaleString() : value ?? '—'}
        </div>
      </div>

      {/* Bottom Row: Context Subtitle */}
      {subtitle && (
        <div
          style={{
            fontSize: 11.5,
            color: '#64748b',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
