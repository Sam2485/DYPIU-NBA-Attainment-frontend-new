import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // 'success' | 'warning' | 'danger' | 'info' | 'default'
  size = 'md', // 'sm' | 'md'
  style = {},
  className = '',
}) => {
  // Normalize string variant if passed status text
  const valStr = String(children || variant).toUpperCase();
  let bg = '#f1f5f9';
  let color = '#475569';
  let border = '#e2e8f0';

  if (['ACTIVE', 'APPROVED', 'VERIFIED', 'COMPLETED', 'SUCCESS', 'UP', 'HEALTHY'].includes(valStr) || variant === 'success') {
    bg = 'var(--success-bg)';
    color = 'var(--success-text)';
    border = 'var(--success-border)';
  } else if (['PENDING', 'SUBMITTED', 'IN_PROGRESS', 'NEEDS_REVIEW', 'WARNING'].includes(valStr) || variant === 'warning') {
    bg = 'var(--warning-bg)';
    color = 'var(--warning-text)';
    border = 'var(--warning-border)';
  } else if (['INACTIVE', 'REJECTED', 'REVISION_REQUESTED', 'FAILED', 'DEGRADED', 'DANGER'].includes(valStr) || variant === 'danger') {
    bg = 'var(--danger-bg)';
    color = 'var(--danger-text)';
    border = 'var(--danger-border)';
  } else if (['DRAFT', 'INFO', 'THEORY', 'LAB'].includes(valStr) || variant === 'info') {
    bg = 'var(--info-bg)';
    color = 'var(--info-text)';
    border = 'var(--info-border)';
  }

  const sizeStyles = {
    sm: { padding: '2px 6px', fontSize: '10px', fontWeight: '700' },
    md: { padding: '3px 8px', fontSize: '11px', fontWeight: '700' },
  }[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        borderRadius: '999px',
        border: `1px solid ${border}`,
        backgroundColor: bg,
        color: color,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        lineHeight: 1.2,
        ...sizeStyles,
        ...style,
      }}
      className={`admin-badge ${className}`}
    >
      {children}
    </span>
  );
};
