import axios from 'axios';

const getSessionData = (key) => {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key) || null;
  } catch (e) {
    return null;
  }
};

const saveSessionData = (key, value) => {
  try {
    localStorage.setItem(key, value);
    sessionStorage.setItem(key, value);
  } catch (e) {}
};

const clearSessionData = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {}
};

// Base API Client configured for Spring Boot backend integration on localhost:8080 via Vite Proxy /api/v1
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = getSessionData('accessToken') || getSessionData('authToken') || getSessionData('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`, config.data || '');
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle global errors and automatic Token Refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response Success]`, response.status, response.data);
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error(`[API Response Error]`, error.response?.status, error.response?.data || error.message);

    // Handle 401 Unauthorized errors with Automatic Refresh Token Session Management
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getSessionData('refreshToken');

      // Do not attempt refresh on auth endpoints to prevent loops
      if (!refreshToken || originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh-token')) {
        clearSessionData();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
        const resData = refreshResponse.data?.data || refreshResponse.data;

        const newAccessToken = resData?.accessToken || resData?.token;
        const newRefreshToken = resData?.refreshToken || refreshToken;

        if (newAccessToken) {
          saveSessionData('accessToken', newAccessToken);
          saveSessionData('authToken', newAccessToken);
          saveSessionData('token', newAccessToken);
          if (newRefreshToken) {
            saveSessionData('refreshToken', newRefreshToken);
          }

          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearSessionData();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
