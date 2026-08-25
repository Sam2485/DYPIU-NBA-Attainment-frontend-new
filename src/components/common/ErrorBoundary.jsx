import { Component } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      const basePath = import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/+$/, '') : '/nba';
      window.location.href = `${basePath}/dashboard`;
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const title = this.props.fallbackTitle || 'Something went wrong';
      const message =
        this.props.fallbackMessage ||
        this.state.error?.customMessage ||
        this.state.error?.message ||
        'This screen could not be loaded due to an unexpected error.';

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: this.props.isScreen ? '50vh' : '220px',
            padding: '24px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #fed7aa',
              borderRadius: '12px',
              padding: '24px 28px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#fff7ed',
                color: '#ea580c',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 14px',
              }}
            >
              <AlertTriangle size={22} />
            </div>

            <h3
              style={{
                margin: '0 0 8px',
                fontSize: '17px',
                fontWeight: '800',
                color: '#0f172a',
              }}
            >
              {title}
            </h3>

            <p
              style={{
                margin: '0 0 20px',
                fontSize: '13px',
                color: '#64748b',
                lineHeight: 1.5,
              }}
            >
              {message}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={this.handleRetry}
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

              <button
                type="button"
                onClick={this.handleBack}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ArrowLeft size={14} /> Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
