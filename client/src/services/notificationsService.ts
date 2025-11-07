import type { NotifAttributes } from '@/interfaces/global';

export class NotificationsService {
  // Get all notifications for a user
  static async getNotifications(userId: string): Promise<NotifAttributes[]> {
    try {
      console.log('Fetching notifications for user:', userId);
      const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/notifications/get-list/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform backend data to match frontend interface
      return data.map((notif: any) => ({
        id: notif.id.toString(),
        title: notif.title,
        message: notif.message,
        timestamp: notif.created_at,
        read: notif.is_read,
        type: notif.type as 'info' | 'alert' | 'system',
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/notifications/mark-as-read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_id: notificationId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/notifications/mark-all-as-read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Send broadcast notification (admin only)
  static async sendBroadcastNotification(data: {
    title: string;
    message: string;
    type: 'info' | 'alert' | 'system';
  }): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/notifications/admin/broadcast/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          message: data.message,
          type: data.type
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
      throw error;
    }
  }

  // Send personal notification to a specific user
  static async sendPersonalNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'alert' | 'system';
  }): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/notifications/send-personal/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: data.userId,
          title: data.title,
          message: data.message,
          type: data.type
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error sending personal notification:', error);
      throw error;
    }
  }

  // Clear all notifications for a user
  static async clearNotifications(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/notifications/clear/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }
}

export default NotificationsService;
