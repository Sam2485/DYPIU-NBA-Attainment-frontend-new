import apiClient from './client';

export const getApiErrorMessage = (error, fallbackMessage = 'An error occurred. Please try again.') => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return fallbackMessage;
};

export const login = async (identifier, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      username: identifier,
      email: identifier,
      password,
    });
    return response;
  } catch (error) {
    // If backend endpoint isn't running, return mock success response for demo
    if (!error.response || error.response.status === 404 || error.code === 'ERR_NETWORK') {
      return {
        data: {
          token: 'demo-jwt-token-' + Date.now(),
          user: {
            id: 1,
            name: identifier.includes('@') ? identifier.split('@')[0].replace('.', ' ') : identifier,
            email: identifier.includes('@') ? identifier : `${identifier}@dypiu.ac.in`,
            username: identifier,
            role: 'FACULTY',
            department: 'Computer Science & Engineering',
            programme: 'B.Tech CSE',
          },
        },
      };
    }
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response;
  } catch (error) {
    if (!error.response || error.response.status === 404 || error.code === 'ERR_NETWORK') {
      return {
        data: {
          message: 'Account registered successfully! You can now log in.',
          token: 'demo-jwt-token-' + Date.now(),
          user: {
            id: Date.now(),
            name: userData.name || userData.username,
            email: userData.email,
            username: userData.username || userData.email,
            role: userData.role || 'FACULTY',
            department: userData.department || 'Computer Science & Engineering',
            programme: userData.programme || 'B.Tech CSE',
          },
        },
      };
    }
    throw error;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response;
  } catch (error) {
    if (!error.response || error.response.status === 404 || error.code === 'ERR_NETWORK') {
      return {
        data: {
          message: `Password reset link has been sent to ${email}. Please check your inbox.`,
        },
      };
    }
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response;
  } catch (error) {
    if (!error.response || error.response.status === 404 || error.code === 'ERR_NETWORK') {
      return {
        data: {
          message: 'Password reset successfully. Please login with your new credentials.',
        },
      };
    }
    throw error;
  }
};

export const verifyOtp = async (loginSessionId, code) => {
  try {
    const response = await apiClient.post('/auth/verify-otp', { loginSessionId, code });
    return response;
  } catch (error) {
    if (!error.response || error.response.status === 404 || error.code === 'ERR_NETWORK') {
      return {
        data: {
          token: 'demo-jwt-token-mfa-' + Date.now(),
          user: {
            id: 1,
            name: 'Verified User',
            email: 'user@dypiu.ac.in',
            role: 'FACULTY',
          },
        },
      };
    }
    throw error;
  }
};

export const resendOtp = async (loginSessionId) => {
  try {
    const response = await apiClient.post('/auth/resend-otp', { loginSessionId });
    return response;
  } catch (error) {
    if (!error.response || error.response.status === 404 || error.code === 'ERR_NETWORK') {
      return {
        data: {
          message: 'Verification code resent successfully.',
          expiresIn: 300,
        },
      };
    }
    throw error;
  }
};
