import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  options = [], // Array of { value, label } or strings
  error,
  helperText,
  fullWidth = true,
  required = false,
  placeholder = 'Select an option',
  className = '',
  style = {},
  id,
  value,
  onChange,
  disabled = false,
  ...props
}) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: fullWidth ? '100%' : 'auto', ...style }}>
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          id={selectId}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: '100%',
            height: '38px',
            padding: '8px 36px 8px 12px',
            fontSize: '13px',
            color: value ? 'var(--text-primary)' : 'var(--text-muted)',
            backgroundColor: disabled ? '#f8fafc' : '#ffffff',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border-muted)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            appearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.15s ease',
          }}
          className={`admin-select ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>

        <div
          style={{
            position: 'absolute',
            right: '12px',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronDown size={16} />
        </div>
      </div>

      {error ? (
        <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: '500' }}>{error}</div>
      ) : helperText ? (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{helperText}</div>
      ) : null}
    </div>
  );
};
