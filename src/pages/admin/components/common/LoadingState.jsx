import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading...', minHeight = '200px' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: '12px',
        color: 'var(--text-muted)',
      }}
    >
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
      <span style={{ fontSize: '13px', fontWeight: '500' }}>{message}</span>
    </div>
  );
};
