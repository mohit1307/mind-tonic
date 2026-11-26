const Notification = require('../models/Notification');
const ApiError = require('../utils/apiError');

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(userId, data) {
    return await Notification.create({
      userId,
      title: data.title,
      message: data.message,
      type: data.type || 'system',
      priority: data.priority || 'medium',
      link: data.link || '',
      metadata: data.metadata || {},
    });
  }

  /**
   * Get user notifications
   */
  async getNotifications(userId, { unreadOnly = false, limit = 30 } = {}) {
    const query = { userId };
    if (unreadOnly) query.isRead = false;

    return await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    return await Notification.countDocuments({ userId, isRead: false });
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { returnDocument: 'after' }
    );
    if (!notification) throw ApiError.notFound('Notification not found');
    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return { markedCount: result.modifiedCount };
  }

  /**
   * Delete a notification
   */
  async deleteNotification(userId, notificationId) {
    const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
    if (!notification) throw ApiError.notFound('Notification not found');
    return { message: 'Notification deleted' };
  }

  /**
   * Clear all read notifications
   */
  async clearAll(userId) {
    const result = await Notification.deleteMany({ userId });
    return { deletedCount: result.deletedCount };
  }
}

module.exports = new NotificationService();
