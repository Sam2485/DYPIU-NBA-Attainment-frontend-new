import axios from 'axios';

// Helper to resolve and normalize the API base URL from environment or default
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || envUrl.trim() === '') {
    return '/api/v1';
  }
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  // If the provided base URL already ends with /api/v1, use it as is; otherwise append /api/v1
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
};

// Base API Client configured for backend integration
const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
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

// Response Interceptor: Handle global errors (e.g. 401 Unauthorized)
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
    return Promise.reject(error);
  }
);

export default apiClient;
