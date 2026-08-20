import axios from 'axios';

// Helper to resolve and normalize the API base URL
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '' && !envUrl.startsWith('/')) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  }
  // Auto-detect browser host IP/domain and point to backend port 8010
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const protocol = window.location.protocol || 'http:';
    const host = window.location.hostname;
    return `${protocol}//${host}:8010/api/v1`;
  }
  return 'http://localhost:8010/api/v1';
};

// Base API Client configured for backend integration
const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach JWT Token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData (multipart file upload), let browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors and handle auth expiry
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('nba_user');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('user');
    }

    // Extract exact backend error details
    if (error.response) {
      const { status, statusText, data } = error.response;
      let detailedMessage = '';
      if (typeof data === 'string' && data.includes('<title>')) {
        const match = data.match(/<title>(.*?)<\/title>/i);
        detailedMessage = `Server Error (${status}): ${match ? match[1] : statusText}`;
      } else if (data?.message) {
        detailedMessage = data.message;
      } else if (data?.error) {
        detailedMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else {
        detailedMessage = `HTTP ${status}: ${statusText || 'Request failed'}`;
      }
      error.customMessage = detailedMessage;
    } else if (error.request) {
      error.customMessage = 'Unable to connect to backend server at ' + resolveBaseUrl() + '. Please ensure backend is running on port 8010.';
    } else {
      error.customMessage = error.message || 'An unexpected error occurred.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
