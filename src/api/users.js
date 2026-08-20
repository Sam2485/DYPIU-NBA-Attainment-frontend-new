import apiClient from './client';

export const usersApi = {
  getUsers: (role) => {
    const params = role
      ? { role }
      : {};

    return apiClient.get(
      '/users',
      { params }
    );
  },

  getUserById: (id) =>
    apiClient.get(
      `/users/${id}`
    ),

  createUser: (userData) =>
    apiClient.post(
      '/users',
      userData
    ),

  updateUser: (id, userData) =>
    apiClient.put(
      `/users/${id}`,
      userData
    ),

  deleteUser: (id) =>
    apiClient.delete(
      `/users/${id}`
    ),
};

export default usersApi;