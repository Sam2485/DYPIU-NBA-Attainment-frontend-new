import { Loader2, AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

export function ScreenLoadingState({ message = 'Loading data...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '260px',
        padding: '32px',
        color: '#64748b',
      }}
    >
      <Loader2 size={32} className="spin-animation" style={{ color: '#4f46e5', marginBottom: '12px' }} />
      <span style={{ fontSize: '13.5px', fontWeight: '600' }}>{message}</span>
    </div>
  );
}

export function ScreenErrorState({
  title = 'Failed to load screen',
  message = 'An error occurred while fetching data.',
  onRetry,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '260px',
        padding: '32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: '#fef2f2',
          color: '#ef4444',
          display: 'grid',
          placeItems: 'center',
          marginBottom: '12px',
        }}
      >
        <AlertTriangle size={22} />
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b', maxWidth: '420px' }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            height: '36px',
            padding: '0 16px',
            fontSize: '13px',
            fontWeight: '700',
            background: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '7px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}

export function ScreenEmptyState({
  title = 'No data available',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '220px',
        padding: '32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: '#f8fafc',
          color: '#94a3b8',
          display: 'grid',
          placeItems: 'center',
          marginBottom: '12px',
        }}
      >
        <Inbox size={20} />
      </div>
      <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
        {title}
      </h4>
      <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#64748b', maxWidth: '360px' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            height: '32px',
            padding: '0 14px',
            fontSize: '12.5px',
            fontWeight: '600',
            background: '#ffffff',
            color: '#4f46e5',
            border: '1px solid #c7d2fe',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
