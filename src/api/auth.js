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
  const response = await apiClient.post('/auth/login', {
    username: identifier,
    email: identifier,
    password,
  });
  return response;
};

export const refreshAccessToken = async (refreshToken) => {
  const response = await apiClient.post('/auth/refresh-token', { refreshToken });
  return response;
};

export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response;
};

export const requestPasswordReset = async (email) => {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response;
};

export const resetPassword = async (token, newPassword) => {
  const response = await apiClient.post('/auth/reset-password', { token, newPassword });
  return response;
};

export const verifyOtp = async (loginSessionId, code) => {
  const response = await apiClient.post('/auth/verify-otp', { loginSessionId, code });
  return response;
};

export const resendOtp = async (loginSessionId) => {
  const response = await apiClient.post('/auth/resend-otp', { loginSessionId });
  return response;
};
