/**
 * Error message extraction and HTTP status code normalization utility.
 * Ensures user-facing alerts and error displays present human-readable messages
 * rather than raw status codes (like "Request failed with status code 409" or "HTTP 409").
 */

export const HTTP_STATUS_MESSAGES = {
  400: 'Invalid request: The submitted data is invalid or incomplete. Please verify your inputs.',
  401: 'Unauthorized: Your session has expired or you are not logged in. Please sign in again.',
  403: 'Access denied: You do not have permission to perform this action.',
  404: 'Not found: The requested resource could not be found.',
  405: 'Method not allowed: This operation is not supported.',
  408: 'Request timeout: The server took too long to respond. Please check your network and try again.',
  409: 'Conflict: Cannot modify data. This record is locked, already approved, or conflicts with existing records.',
  410: 'Resource no longer available: The requested item has been deleted or archived.',
  412: 'Precondition failed: The request does not meet the necessary conditions.',
  413: 'Payload too large: The uploaded file or data exceeds the allowable size limit.',
  415: 'Unsupported media type: The file format is not supported.',
  422: 'Unprocessable entity: The submitted data could not be processed. Please check your inputs.',
  429: 'Too many requests: You have sent too many requests. Please wait a moment and try again.',
  500: 'Internal server error: The server encountered an unexpected error. Please try again later.',
  502: 'Bad gateway: The backend server received an invalid response from an upstream service.',
  503: 'Service unavailable: The server is temporarily offline or undergoing maintenance. Please try again shortly.',
  504: 'Gateway timeout: The server took too long to respond. Please try again later.',
};

/**
 * Extracts a clean, user-friendly error message from any error object (Axios error, Error, string, etc.)
 *
 * @param {any} error - The error thrown or caught
 * @param {string} [fallback='An unexpected error occurred. Please try again.'] - Default fallback message
 * @returns {string} Human-readable error message
 */
export const getErrorMessage = (error, fallback = 'An unexpected error occurred. Please try again.') => {
  if (!error) return fallback;
  if (typeof error === 'string') {
    const trimmed = error.trim();
    if (!trimmed) return fallback;
    const match = trimmed.match(/status code (\d{3})/i) || trimmed.match(/^HTTP (\d{3})/i);
    if (match) {
      const code = parseInt(match[1], 10);
      if (HTTP_STATUS_MESSAGES[code]) return HTTP_STATUS_MESSAGES[code];
    }
    return trimmed;
  }

  // 1. Check if error.response exists (Axios error response)
  const response = error.response;
  if (response) {
    const { status, data, statusText } = response;

    // Check data payload from backend
    if (data) {
      // HTML response (e.g., error page from reverse proxy or server)
      if (typeof data === 'string' && data.includes('<title>')) {
        const titleMatch = data.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          const title = titleMatch[1].trim();
          if (title && !title.toLowerCase().includes('error')) {
            return `Server Error: ${title}`;
          }
        }
      }

      // JSON string response
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed?.message && typeof parsed.message === 'string' && parsed.message.trim()) {
            return parsed.message.trim();
          }
          if (parsed?.error && typeof parsed.error === 'string' && parsed.error.trim()) {
            return parsed.error.trim();
          }
        } catch {
          const trimmed = data.trim();
          if (trimmed && !trimmed.startsWith('<') && !trimmed.toLowerCase().startsWith('error')) {
            return trimmed;
          }
        }
      }

      // Standard backend JSON ApiResponse { success: false, message: "..." }
      if (typeof data === 'object') {
        if (data.message && typeof data.message === 'string' && data.message.trim()) {
          return data.message.trim();
        }
        if (data.error) {
          if (typeof data.error === 'string' && data.error.trim()) {
            return data.error.trim();
          }
          if (typeof data.error === 'object' && data.error.message) {
            return String(data.error.message).trim();
          }
        }
        if (data.reason && typeof data.reason === 'string' && data.reason.trim()) {
          return data.reason.trim();
        }
        if (data.detail && typeof data.detail === 'string' && data.detail.trim()) {
          return data.detail.trim();
        }
        if (data.errors) {
          if (Array.isArray(data.errors) && data.errors.length > 0) {
            const items = data.errors
              .map((e) => (typeof e === 'string' ? e : e.defaultMessage || e.message || ''))
              .filter(Boolean);
            if (items.length > 0) return items.join(', ');
          }
          if (typeof data.errors === 'object') {
            const items = Object.values(data.errors).filter(Boolean);
            if (items.length > 0) return items.join(', ');
          }
        }
      }
    }

    // If backend did not provide a specific message, use friendly status code mapping
    if (status && HTTP_STATUS_MESSAGES[status]) {
      return HTTP_STATUS_MESSAGES[status];
    }

    if (status >= 400 && status < 500) {
      return statusText || `Request error (${status}): Unable to complete the request.`;
    }

    if (status >= 500) {
      return statusText || `Server error (${status}): An error occurred on the server.`;
    }
  }

  // 2. Custom message if set earlier
  if (error.customMessage && typeof error.customMessage === 'string' && error.customMessage.trim()) {
    const msg = error.customMessage.trim();
    const match = msg.match(/status code (\d{3})/i) || msg.match(/^HTTP (\d{3})/i);
    if (match) {
      const code = parseInt(match[1], 10);
      if (HTTP_STATUS_MESSAGES[code]) return HTTP_STATUS_MESSAGES[code];
    }
    return msg;
  }

  // 3. Network or connection errors
  if (error.request && !error.response) {
    return 'Unable to connect to the server. Please check your network connection and verify that the backend is running.';
  }

  // 4. Standard error message (filter out raw "Request failed with status code XXX")
  if (error.message && typeof error.message === 'string' && error.message.trim()) {
    const rawMsg = error.message.trim();
    const statusMatch = rawMsg.match(/status code (\d{3})/i) || rawMsg.match(/^HTTP (\d{3})/i);
    if (statusMatch) {
      const code = parseInt(statusMatch[1], 10);
      if (HTTP_STATUS_MESSAGES[code]) {
        return HTTP_STATUS_MESSAGES[code];
      }
    }
    return rawMsg;
  }

  return fallback;
};

export default getErrorMessage;
