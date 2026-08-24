import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Render Container */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '400px',
        }}
      >
        {toasts.map((toast) => {
          let bg = '#ffffff';
          let border = '#e2e8f0';
          let textColor = '#0f172a';
          let Icon = Info;
          let iconColor = '#0ea5e9';

          if (toast.type === 'success') {
            bg = '#ecfdf5';
            border = '#a7f3d0';
            textColor = '#065f46';
            Icon = CheckCircle2;
            iconColor = '#10b981';
          } else if (toast.type === 'error') {
            bg = '#fef2f2';
            border = '#fecaca';
            textColor = '#991b1b';
            Icon = AlertCircle;
            iconColor = '#ef4444';
          } else if (toast.type === 'warning') {
            bg = '#fffbeb';
            border = '#fde68a';
            textColor = '#92400e';
            Icon = AlertTriangle;
            iconColor = '#f59e0b';
          }

          return (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: bg,
                border: `1px solid ${border}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                color: textColor,
                fontSize: '13px',
                fontWeight: '500',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <Icon size={18} color={iconColor} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  opacity: 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
