import apiClient from '../../../api/client';

export const messengerApi = {
  // Directory & Users
  searchUsers: async (query = '') => {
    const res = await apiClient.get('/messenger/users', { params: { query } });
    return res.data?.data || res.data || [];
  },

  // Conversations
  listConversations: async () => {
    const res = await apiClient.get('/messenger/conversations');
    return res.data?.data || res.data || [];
  },

  getOrCreateDirectConversation: async (peerUserId) => {
    const res = await apiClient.post('/messenger/conversations/direct', { peerUserId });
    return res.data?.data || res.data;
  },

  // Messages
  getConversationMessages: async (conversationId, page = 0, size = 50) => {
    const res = await apiClient.get(`/messenger/conversations/${conversationId}/messages`, {
      params: { page, size },
    });
    return res.data?.data || res.data || [];
  },

  sendMessage: async (conversationId, { content, iv, isEncrypted }) => {
    const res = await apiClient.post(`/messenger/conversations/${conversationId}/messages`, {
      content,
      iv,
      isEncrypted,
    });
    return res.data?.data || res.data;
  },

  markConversationAsRead: async (conversationId) => {
    const res = await apiClient.put(`/messenger/conversations/${conversationId}/read`);
    return res.data;
  },

  // Suggestions
  createSuggestion: async (payload) => {
    const res = await apiClient.post('/suggestions', payload);
    return res.data?.data || res.data;
  },

  getReceivedSuggestions: async (page = 0, size = 20) => {
    const res = await apiClient.get('/suggestions/received', { params: { page, size } });
    return res.data?.data || res.data || { content: [] };
  },

  getSentSuggestions: async (page = 0, size = 20) => {
    const res = await apiClient.get('/suggestions/sent', { params: { page, size } });
    return res.data?.data || res.data || { content: [] };
  },

  markSuggestionAsRead: async (id) => {
    const res = await apiClient.put(`/suggestions/${id}/read`);
    return res.data;
  },

  // Notifications
  getNotifications: async (page = 0, size = 20) => {
    const res = await apiClient.get('/notifications', { params: { page, size } });
    return res.data?.data || res.data || { content: [] };
  },

  markNotificationAsRead: async (id) => {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsAsRead: async () => {
    const res = await apiClient.put('/notifications/read-all');
    return res.data;
  },

  // Badges
  getBadgeCounts: async () => {
    const res = await apiClient.get('/messenger/badges');
    return res.data?.data || res.data || { unreadChats: 0, unreadSuggestions: 0, unreadNotifications: 0, totalUnread: 0 };
  },
};

export default messengerApi;
