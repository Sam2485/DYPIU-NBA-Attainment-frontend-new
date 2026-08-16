import React from 'react';
import { AlertCircle, CloudOff, RefreshCw, ServerCrash } from 'lucide-react';

export default function NoResponseState({
  title = 'No Response from Server',
  message = 'The backend server is either offline or returned no data for this query. The UI remains accessible.',
  onRetry = null,
  compact = false,
}) {
  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          background: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: '8px',
          color: '#64748b',
          fontSize: '12px',
          margin: '8px 0',
        }}
      >
        <CloudOff size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11.5px',
            }}
          >
            <RefreshCw size={12} /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '36px 24px',
        textAlign: 'center',
        background: '#ffffff',
        border: '1.5px dashed #cbd5e1',
        borderRadius: '14px',
        margin: '16px 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: '#f1f5f9',
          color: '#64748b',
          display: 'grid',
          placeItems: 'center',
          margin: '0 auto 12px',
        }}
      >
        <CloudOff size={24} style={{ color: '#64748b' }} />
      </div>
      <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>
        {title}
      </h4>
      <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748b', maxWidth: '440px', marginInline: 'auto', lineHeight: 1.5 }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            padding: '6px 16px',
          }}
        >
          <RefreshCw size={14} /> Retry Connection
        </button>
      )}
    </div>
  );
}
