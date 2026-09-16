import { getApiAuthToken } from '../../../api/client';

/**
 * WebSocket manager for live real-time bidirectional streaming with Spring Boot
 * Communicates strictly with the Spring Boot backend (/api/v1/ws/chat)
 * NEVER connects to Ollama directly.
 */

const getAuthToken = () => {
  let token = getApiAuthToken();
  if (!token && typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem('nba_auth_session') || localStorage.getItem('nba_auth_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        token = parsed?.accessToken || parsed?.token || null;
      }
      if (!token) {
        token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken') || null;
      }
    } catch {
      // Ignore storage access errors
    }
  }
  return token || null;
};

const appendTokenToUrl = (rawUrl, token) => {
  if (!token) return rawUrl;
  const separator = rawUrl.includes('?') ? '&' : '?';
  return `${rawUrl}${separator}token=${encodeURIComponent(token)}`;
};

const resolveWsUrl = () => {
  // 1. Explicit VITE_WS_URL takes precedence
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  // 2. Derive from VITE_API_BASE_URL if configured
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  if (apiBase) {
    if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
      const wsUrl = apiBase.replace(/^http/, 'ws');
      const cleanBase = wsUrl.endsWith('/') ? wsUrl.slice(0, -1) : wsUrl;
      return `${cleanBase}/ws/chat`;
    }
    if (typeof window !== 'undefined' && apiBase.startsWith('/')) {
      const isHttps = window.location.protocol === 'https:';
      const wsProto = isHttps ? 'wss:' : 'ws:';
      const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
      return `${wsProto}//${window.location.host}${cleanBase}/ws/chat`;
    }
  }

  // 3. Browser runtime resolution (defaults to backend port 8010 and context path /api/v1)
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const wsProto = isHttps ? 'wss:' : 'ws:';

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'ws://localhost:8010/api/v1/ws/chat';
    }

    return `${wsProto}//${window.location.host}/api/v1/ws/chat`;
  }

  return 'ws://localhost:8010/api/v1/ws/chat';
};

export class ChatWebSocketClient {
  constructor(urlProvider = resolveWsUrl) {
    this.urlProvider = urlProvider;
    this.ws = null;
    this.reconnectTimer = null;
    this.pendingCallbacks = null;
    this.isConnected = false;
    this.statusListeners = new Set();
    this.reconnectAttempts = 0;
  }

  get url() {
    return typeof this.urlProvider === 'function' ? this.urlProvider() : this.urlProvider;
  }

  onStatusChange(cb) {
    this.statusListeners.add(cb);
    cb(this.isConnected);
    return () => this.statusListeners.delete(cb);
  }

  notifyStatus(connected) {
    this.isConnected = connected;
    this.statusListeners.forEach((cb) => {
      try {
        cb(connected);
      } catch (e) {
        console.error('[Emmu WS] Status listener error:', e);
      }
    });
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      // Do not open an unauthenticated WebSocket connection
      this.notifyStatus(false);
      return;
    }

    const rawUrl = this.url;
    const urlWithToken = appendTokenToUrl(rawUrl, token);

    try {
      this.ws = new WebSocket(urlWithToken);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.notifyStatus(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.pendingCallbacks) {
            if (data.type === 'token') {
              this.pendingCallbacks.onToken?.(data.token);
            } else if (data.type === 'metadata') {
              this.pendingCallbacks.onMetadata?.(data);
            } else if (data.type === 'done') {
              const cb = this.pendingCallbacks;
              this.pendingCallbacks = null;
              cb.onDone?.();
            } else if (data.type === 'error') {
              const cb = this.pendingCallbacks;
              this.pendingCallbacks = null;
              cb.onError?.(new Error(data.message || 'The OBE assistant encountered an error. Please try again.'));
            } else if (data.type === 'stopped') {
              const cb = this.pendingCallbacks;
              this.pendingCallbacks = null;
              cb.onStopped?.();
            }
          }
        } catch (err) {
          console.error('[Emmu WS] Parse error:', err);
        }
      };

      this.ws.onclose = () => {
        this.notifyStatus(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[Emmu WS] Connection error:', err);
        this.notifyStatus(false);
      };
    } catch (err) {
      console.warn('[Emmu WS] Socket initialization failed:', err);
      this.notifyStatus(false);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 8000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (getAuthToken()) {
        this.connect();
      }
    }, delay);
  }

  /**
   * Send a prompt with conversation history and academic UI context
   */
  sendChat({ message, history = [], context = null, onToken, onMetadata, onDone, onError, onStopped }) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please log in to chat with Emmu.');
    }

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
      throw new Error('Connecting to OBE chat assistant. Please try again in a moment.');
    }

    this.pendingCallbacks = { onToken, onMetadata, onDone, onError, onStopped };

    const payload = {
      type: 'chat',
      message,
      history,
      context,
    };

    this.ws.send(JSON.stringify(payload));
  }

  /**
   * Cancel currently running generation
   */
  stop() {
    const cb = this.pendingCallbacks;
    this.pendingCallbacks = null;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'stop' }));
      } catch (err) {
        console.warn('[Emmu WS] Failed to send stop action:', err);
      }
    }

    if (cb?.onStopped) {
      try {
        cb.onStopped();
      } catch (e) {
        console.error('[Emmu WS] Error in onStopped callback:', e);
      }
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.notifyStatus(false);
  }
}

export const emmuSocket = new ChatWebSocketClient();
export default emmuSocket;
