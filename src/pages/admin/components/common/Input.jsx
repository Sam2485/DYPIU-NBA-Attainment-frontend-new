import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  fullWidth = true,
  required = false,
  className = '',
  style = {},
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: fullWidth ? '100%' : 'auto', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Icon size={16} />
          </div>
        )}

        <input
          id={inputId}
          style={{
            width: '100%',
            height: '38px',
            padding: Icon ? '8px 12px 8px 36px' : '8px 12px',
            fontSize: '13px',
            color: 'var(--text-primary)',
            backgroundColor: '#ffffff',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border-muted)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
          className={`admin-input ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: '500' }}>{error}</div>
      ) : helperText ? (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{helperText}</div>
      ) : null}
    </div>
  );
};
