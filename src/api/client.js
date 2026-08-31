import axios from 'axios';

/* ========================================================================== */
/* Backend base URL                                                           */
/* ========================================================================== */

const LOCAL_BACKEND_URL = 'http://localhost:8080/api/v1';
const currentActiveUrl = import.meta.env.VITE_API_BASE_URL || LOCAL_BACKEND_URL;

/* ========================================================================== */
/* In-memory authentication token                                             */
/* ========================================================================== */

let authToken = null;
let tokenRefreshHandler = null;
let refreshInFlight = null;

export const setApiAuthToken = (token) => {
  authToken = token || null;
};

export const clearApiAuthToken = () => {
  authToken = null;
};

export const getApiAuthToken = () => {
  return authToken;
};

// AuthContext owns storage and user state. The API client only asks it for a
// fresh token when an authenticated request receives a 401.
export const setApiTokenRefreshHandler = (handler) => {
  tokenRefreshHandler = typeof handler === 'function' ? handler : null;
};

/* ========================================================================== */
/* Client                                                                     */
/* ========================================================================== */

const apiClient = axios.create({
  baseURL: currentActiveUrl,

  headers: {
    'Content-Type': 'application/json',
  },

  timeout: 30000,
});

/* ========================================================================== */
/* Request body sanitizer                                                      */
/* ========================================================================== */

const sanitizeRequestBody = (data) => {
  if (!data) {
    return data;
  }

  if (
    typeof FormData !== 'undefined' &&
    data instanceof FormData
  ) {
    return '[FormData]';
  }

  if (typeof data !== 'object') {
    return data;
  }

  try {
    const sanitized = { ...data };

    [
      'password',
      'currentPassword',
      'newPassword',
      'confirmPassword',
      'accessToken',
      'refreshToken',
      'token',
      'authorization',
    ].forEach((key) => {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  } catch {
    return '[Unserializable request body]';
  }
};

/* ========================================================================== */
/* Request Interceptor                                                        */
/* ========================================================================== */

apiClient.interceptors.request.use(
  (config) => {
    // Use the configured backend. Development defaults to localhost:8080.
    config.baseURL = currentActiveUrl;

    const token = authToken;

    config.headers = config.headers || {};

    // Keep native FormData intact. In particular, do not let the client's
    // JSON default override the browser-generated multipart boundary.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ========================================================================== */
/* Response Interceptor                                                       */
/* ========================================================================== */

apiClient.interceptors.response.use(
  (response) => {
          console.log('[API RESPONSE]', {
      method: response.config?.method?.toUpperCase(),
      url: response.config?.url,
      status: response.status,
      params: response.config?.params,
      requestBody: sanitizeRequestBody(
        response.config?.data
      ),
      response: response.data,
    });

    return response.data;
  },

  async (error) => {

    /* ---------------------------------------------------------------------- */
    /* Authentication expiry                                                 */
    /* ---------------------------------------------------------------------- */

    if (error.response?.status === 401) {
      const request = error.config || {};
      const requestUrl = String(request.url || '');
      const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/logout') || requestUrl.includes('/auth/refresh');

      if (!request.__skipAuthRefresh && !request.__retriedWithFreshToken && !isAuthRequest && tokenRefreshHandler) {
        try {
          refreshInFlight ??= Promise.resolve(tokenRefreshHandler()).finally(() => {
            refreshInFlight = null;
          });
          const refreshedToken = await refreshInFlight;
          if (refreshedToken) {
            request.__retriedWithFreshToken = true;
            return apiClient(request);
          }
        } catch {
          // Fall through to a clean signed-out state below.
        }
      }

      clearApiAuthToken();

      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('nba_auth_session');
        sessionStorage.removeItem('nba_user');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('user');
      }

      if (typeof localStorage !== 'undefined') localStorage.removeItem('authToken');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('nba-auth-expired'));
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Backend error normalization                                            */
    /* ---------------------------------------------------------------------- */

    if (error.response) {
      const {
        status,
        statusText,
        data,
      } = error.response;

      let detailedMessage = '';

      if (
        typeof data === 'string' &&
        data.includes('<title>')
      ) {
        const match = data.match(
          /<title>(.*?)<\/title>/i
        );

        detailedMessage =
          `Server Error (${status}): ${
            match ? match[1] : statusText
          }`;
      } else if (data?.message) {
        detailedMessage = data.message;
      } else if (data?.error) {
        detailedMessage =
          typeof data.error === 'string'
            ? data.error
            : JSON.stringify(data.error);
      } else {
        detailedMessage =
          `HTTP ${status}: ${
            statusText || 'Request failed'
          }`;
      }

      error.customMessage = detailedMessage;
    } else if (error.request) {
      error.customMessage =
        `Unable to connect to backend server at ${currentActiveUrl}.`;
    } else {
      error.customMessage =
        error.message ||
        'An unexpected error occurred.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
