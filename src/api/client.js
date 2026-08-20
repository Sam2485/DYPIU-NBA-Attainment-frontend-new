import axios from 'axios';

/* ========================================================================== */
/* Base URL                                                                   */
/* ========================================================================== */

const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (envUrl && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');

    return trimmed.endsWith('/api/v1')
      ? trimmed
      : `${trimmed}/api/v1`;
  }

  if (
    typeof window !== 'undefined' &&
    window.location?.hostname
  ) {
    const protocol = window.location.protocol || 'http:';
    const host = window.location.hostname;

    return `${protocol}//${host}:8080/api/v1`;
  }

  return 'https://localhost:8080/api/v1';
};

/* ========================================================================== */
/* In-memory authentication token                                             */
/* ========================================================================== */

/*
 * AuthContext will set this immediately after successful login.
 *
 * This keeps apiClient and AuthContext synchronized without requiring
 * apiClient to directly depend on React context.
 */
let authToken = null;

export const setApiAuthToken = (token) => {
  authToken = token || null;
};

export const clearApiAuthToken = () => {
  authToken = null;
};

export const getApiAuthToken = () => {
  return authToken;
};

/* ========================================================================== */
/* Client                                                                     */
/* ========================================================================== */

const apiClient = axios.create({
  baseURL: resolveBaseUrl(),

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
    const token = authToken;

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    console.log('[AUTH DEBUG]', {
      url: config.url,
      hasToken: Boolean(token),
      hasAuthorizationHeader:
        Boolean(config.headers.Authorization),
      authorizationPrefix:
        config.headers.Authorization
          ? config.headers.Authorization.substring(0, 20) + '...'
          : null,
    });

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

    /*
     * Preserve the existing application contract:
     * callers receive response.data rather than AxiosResponse.
     */
    return response.data;
  },

  (error) => {
    console.error('[API ERROR]', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      params: error.config?.params,
      requestBody: sanitizeRequestBody(
        error.config?.data
      ),
      response: error.response?.data,
      message: error.message,
    });

    /* ---------------------------------------------------------------------- */
    /* Authentication expiry                                                 */
    /* ---------------------------------------------------------------------- */

    if (error.response?.status === 401) {
      /*
       * Clear the in-memory token immediately so subsequent requests
       * do not keep sending an expired/invalid JWT.
       */
      clearApiAuthToken();

      /*
       * Keep legacy cleanup for any old browser-stored auth state.
       * This can be removed later when authentication persistence
       * is fully cleaned up.
       */
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('nba_user');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('user');

      localStorage.removeItem('authToken');
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
        `Unable to connect to backend server at ${resolveBaseUrl()}.`;
    } else {
      error.customMessage =
        error.message ||
        'An unexpected error occurred.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;