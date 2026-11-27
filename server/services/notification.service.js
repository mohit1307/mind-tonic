const { supabaseDb } = require('../db/supabaseDb');
const ApiError = require('../utils/apiError');

function mapNotifToApi(n) {
  if (!n) return null;
  return {
    _id: n.id,
    id: n.id,
    userId: n.user_id,
    title: n.title,
    message: n.message,
    type: n.type || 'schedule',
    priority: n.priority || 'medium',
    isRead: Boolean(n.is_read),
    link: n.link || '',
    metadata: n.metadata || {},
    createdAt: n.created_at,
  };
}

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(userId, data) {
    const row = {
      user_id: userId,
      title: data.title,
      message: data.message,
      type: data.type || 'schedule',
      priority: data.priority || 'medium',
      link: data.link || '',
      metadata: data.metadata || {},
      is_read: false,
    };

    const created = await supabaseDb.insert('notifications', row);
    return mapNotifToApi(created);
  }

  /**
   * Get user notifications
   */
  async getNotifications(userId, { unreadOnly = false, limit = 30 } = {}) {
    let q = supabaseDb.client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (unreadOnly) {
      q = q.eq('is_read', false);
    }

    const { data } = await q;
    return (data || []).map(mapNotifToApi);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    const { count } = await supabaseDb.client
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_read', false);

    return count || 0;
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(userId, notificationId) {
    const updated = await supabaseDb.update(
      'notifications',
      { id: notificationId, user_id: userId },
      { is_read: true }
    );

    if (!updated || updated.length === 0) {
      throw ApiError.notFound('Notification not found');
    }

    return mapNotifToApi(updated[0]);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    const updated = await supabaseDb.update(
      'notifications',
      { user_id: userId, is_read: false },
      { is_read: true }
    );

    return { markedCount: updated?.length || 0 };
  }
}

module.exports = new NotificationService();
