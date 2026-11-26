import api from './api';

const notificationService = {
  async getNotifications(params = {}) {
    const res = await api.get('/notifications', { params });
    return res.data.data;
  },

  async getUnreadCount() {
    const res = await api.get('/notifications/unread-count');
    return res.data.data.unreadCount;
  },

  async markAsRead(id) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data.data.notification;
  },

  async markAllAsRead() {
    const res = await api.put('/notifications/mark-all-read');
    return res.data.data;
  },

  async deleteNotification(id) {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },

  async clearAll() {
    const res = await api.delete('/notifications/clear-all');
    return res.data;
  },
};

export default notificationService;
