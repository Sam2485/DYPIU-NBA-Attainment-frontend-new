import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  style = {},
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: '600',
    borderRadius: 'var(--radius-md)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.15s ease',
    border: '1px solid transparent',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '12px', height: '32px' },
    md: { padding: '8px 16px', fontSize: '13px', height: '38px' },
    lg: { padding: '10px 20px', fontSize: '14px', height: '44px' },
  }[size];

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: '#ffffff',
      borderColor: 'var(--primary)',
    },
    secondary: {
      backgroundColor: '#f1f5f9',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-subtle)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-muted)',
    },
    danger: {
      backgroundColor: 'var(--danger)',
      color: '#ffffff',
      borderColor: 'var(--danger)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      borderColor: 'transparent',
    },
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ...baseStyles, ...sizeStyles, ...variantStyles }}
      className={`admin-btn ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
    </button>
  );
};
