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

  getUserAssignments: (userId) =>
    apiClient.get(
      `/users/${userId}/assignments`
    ),

  addAssignment: (userId, data) =>
    apiClient.post(
      `/users/${userId}/assignments`,
      data
    ),

  updateAssignment: (userId, assignmentId, data) =>
    apiClient.put(
      `/users/${userId}/assignments/${assignmentId}`,
      data
    ),

  removeAssignment: (userId, assignmentId) =>
    apiClient.delete(
      `/users/${userId}/assignments/${assignmentId}`
    ),

  checkEmail: (email) =>
    apiClient.get(
      '/users/check-email',
      { params: { email } }
    ),
};

export default usersApi;