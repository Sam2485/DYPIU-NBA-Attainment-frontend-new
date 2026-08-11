import React from 'react';
import { AlertCircle, UserCheck, MessageSquare, RefreshCw } from 'lucide-react';

export default function RequestRevisionCard({
  title = 'Revision Requested',
  requestedBy = 'HOD / Verifier',
  remarks = 'Please review and update the details as requested.',
  actionText = 'Please revise the details and resubmit for approval.',
  onAction,
  actionButtonText = 'Revise & Update',
  style = {},
}) {
  return (
    <div
      style={{
        background: '#fef2f2',
        border: '1.5px solid #fecaca',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(220,38,38,0.05)',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                borderRadius: '6px',
                padding: '3px 9px',
              }}
            >
              <AlertCircle size={13} /> {title}
            </span>
            {requestedBy && (
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#991b1b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={13} /> By {requestedBy}
              </span>
            )}
          </div>

          <div style={{ margin: '6px 0 4px', fontSize: '13px', color: '#7f1d1d', fontWeight: '500', lineHeight: '1.5' }}>
            <strong style={{ color: '#991b1b', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MessageSquare size={13} /> Remarks:
            </strong>{' '}
            {remarks}
          </div>

          {actionText && (
            <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#b91c1c', fontWeight: '500' }}>
              💡 {actionText}
            </p>
          )}
        </div>

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            style={{
              height: '36px',
              padding: '0 16px',
              fontSize: '12.5px',
              fontWeight: '700',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'inherit',
              boxShadow: '0 2px 6px rgba(220,38,38,0.2)',
            }}
          >
            <RefreshCw size={13} /> {actionButtonText}
          </button>
        )}
      </div>
    </div>
  );
}
