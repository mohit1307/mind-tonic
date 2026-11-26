const notificationService = require('../services/notification.service');
const apiResponse = require('../utils/apiResponse');

class NotificationController {
  async getAll(req, res, next) {
    try {
      const { unreadOnly, limit } = req.query;
      const notifications = await notificationService.getNotifications(req.user.id, {
        unreadOnly: unreadOnly === 'true',
        limit,
      });
      const unreadCount = await notificationService.getUnreadCount(req.user.id);
      return apiResponse.success(res, { notifications, unreadCount }, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const unreadCount = await notificationService.getUnreadCount(req.user.id);
      return apiResponse.success(res, { unreadCount }, 'Unread count retrieved');
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.user.id, req.params.id);
      return apiResponse.success(res, { notification }, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      return apiResponse.success(res, result, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await notificationService.deleteNotification(req.user.id, req.params.id);
      return apiResponse.success(res, result, 'Notification deleted');
    } catch (error) {
      next(error);
    }
  }

  async clearAll(req, res, next) {
    try {
      const result = await notificationService.clearAll(req.user.id);
      return apiResponse.success(res, result, 'All notifications cleared');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
