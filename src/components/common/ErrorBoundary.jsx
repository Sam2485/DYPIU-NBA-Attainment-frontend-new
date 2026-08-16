import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 20px',
            background: '#f8fafc',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '32px 28px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertCircle size={28} />
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Interface Ready — Waiting for Data
            </h3>

            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              The component is ready. No data was returned from the server yet or the backend server is offline.
            </p>

            {this.state.error && (
              <div style={{ margin: '0 0 18px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', textAlign: 'left', fontSize: '11.5px', color: '#991b1b', overflowX: 'auto', fontFamily: 'monospace', maxHeight: '160px' }}>
                <strong>Error:</strong> {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-primary"
                style={{ fontSize: '12.5px', padding: '8px 18px' }}
              >
                Continue to UI
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-secondary"
                style={{ fontSize: '12.5px', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} /> Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
