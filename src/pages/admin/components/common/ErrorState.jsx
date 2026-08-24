import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Failed to load data',
  message = 'An error occurred while communicating with the server.',
  onRetry,
  style = {},
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--danger-bg)',
        border: '1px solid var(--danger-border)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--danger-text)',
        ...style,
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--danger)',
          marginBottom: '12px',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <AlertCircle size={20} />
      </div>
      <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>{title}</h4>
      <p style={{ fontSize: '12px', maxWidth: '400px', margin: '0 0 16px 0', opacity: 0.9 }}>{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} icon={RefreshCw} style={{ backgroundColor: '#ffffff' }}>
          Retry
        </Button>
      )}
    </div>
  );
};
