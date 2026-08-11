import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  title = 'Delete Item?',
  itemName,
  description = 'This action cannot be undone. All data associated with this item will be permanently removed.',
  confirmText = 'Delete',
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  const ink = '#0f172a';
  const muted = '#64748b';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '22px 24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '11px',
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              display: 'grid',
              placeItems: 'center',
              marginBottom: '14px',
            }}
          >
            <Trash2 size={20} style={{ color: '#dc2626' }} />
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '800', color: ink }}>
            {title}
          </h3>
          {itemName && (
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: ink, fontWeight: '700' }}>
              {itemName}
            </p>
          )}
          <p style={{ margin: 0, fontSize: '12.5px', color: muted, lineHeight: '1.4' }}>
            {description}
          </p>
        </div>
        <div
          style={{
            padding: '14px 24px 20px',
            display: 'flex',
            gap: '8px',
            justify: 'flex-end',
            background: '#fafafa',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: '36px',
              padding: '0 16px',
              fontSize: '13px',
              fontWeight: '600',
              background: '#ffffff',
              color: muted,
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              height: '36px',
              padding: '0 18px',
              fontSize: '13px',
              fontWeight: '700',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(220,38,38,0.25)',
            }}
          >
            <Trash2 size={13} /> {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
