import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function AnalyticsErrorState({
  error = 'Failed to load analytics data.',
  onRetry = () => {},
}) {
  return (
    <div
      style={{
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 12,
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        textAlign: 'center',
        margin: '24px 0',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 50,
          background: '#fee2e2',
          color: '#ef4444',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <AlertCircle size={24} />
      </div>

      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>
          Unable to Load Analytics
        </div>
        <div style={{ fontSize: 13, color: '#b91c1c', maxWidth: 460 }}>
          {error}
        </div>
      </div>

      <button
        type="button"
        onClick={onRetry}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#dc2626',
          color: '#ffffff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
        }}
      >
        <RefreshCw size={14} />
        <span>Retry</span>
      </button>
    </div>
  );
}
