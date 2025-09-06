import type { AccessRequest, NotificationItem } from '@/interfaces/global';

// Temporary data for notifications service
const tempAccessRequests: AccessRequest[] = [
  {
    id: 'req1',
    researcherId: 'researcher1',
    researcherName: 'Dr. Sarah Johnson',
    farmId: 'farm2',
    farmName: 'Mountain View Plantation',
    farmOwnerId: 'farmer2',
    message: 'I would like to access your farm data to conduct research on bean varieties. My research focuses on improving crop yields through genetic analysis.',
    status: 'pending',
    createdAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 'req2',
    researcherId: 'researcher2',
    researcherName: 'Dr. Michael Chen',
    farmId: 'farm1',
    farmName: 'Sunrise Coffee Farm',
    farmOwnerId: 'farmer1',
    message: 'I am conducting a study on coffee bean morphology and would appreciate access to your farm\'s bean samples.',
    status: 'accepted',
    createdAt: '2024-01-18T14:20:00Z',
    respondedAt: '2024-01-19T09:15:00Z'
  }
];

const tempNotifications: NotificationItem[] = [
  {
    id: 'notif1',
    type: 'access_request',
    title: 'New Access Request',
    message: 'Dr. Sarah Johnson wants to access Mountain View Plantation',
    fromUserId: 'researcher1',
    fromUserName: 'Dr. Sarah Johnson',
    relatedEntityId: 'req1',
    read: false,
    createdAt: '2024-01-20T10:30:00Z',
    actionRequired: true,
    actionData: { requestId: 'req1' }
  },
  {
    id: 'notif2',
    type: 'access_granted',
    title: 'Access Granted',
    message: 'Your request to access Sunrise Coffee Farm has been approved',
    fromUserId: 'farmer1',
    fromUserName: 'John Smith',
    relatedEntityId: 'farm1',
    read: true,
    createdAt: '2024-01-19T09:15:00Z',
    actionRequired: false
  },
  {
    id: 'notif3',
    type: 'general',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tomorrow from 2-4 AM',
    read: false,
    createdAt: '2024-01-19T16:00:00Z',
    actionRequired: false
  }
];

export class NotificationsService {
  // Get all notifications for a user
  static async getNotifications(userId: string): Promise<NotificationItem[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/notifications/${userId}`);
      // return await response.json();

      await new Promise(resolve => setTimeout(resolve, 100));
      return tempNotifications.filter(notif => 
        notif.fromUserId !== userId // Don't show own notifications
      );
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Get access requests for a farm owner
  static async getAccessRequests(farmOwnerId: string): Promise<AccessRequest[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/access-requests/farm-owner/${farmOwnerId}`);
      // return await response.json();

      await new Promise(resolve => setTimeout(resolve, 100));
      return tempAccessRequests.filter(req => req.farmOwnerId === farmOwnerId);
    } catch (error) {
      console.error('Error fetching access requests:', error);
      throw error;
    }
  }

  // Get access requests sent by a researcher
  static async getResearcherRequests(researcherId: string): Promise<AccessRequest[]> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/access-requests/researcher/${researcherId}`);
      // return await response.json();

      await new Promise(resolve => setTimeout(resolve, 100));
      return tempAccessRequests.filter(req => req.researcherId === researcherId);
    } catch (error) {
      console.error('Error fetching researcher requests:', error);
      throw error;
    }
  }

  // Send access request
  static async sendAccessRequest(data: {
    researcherId: string;
    researcherName: string;
    farmId: string;
    farmName: string;
    farmOwnerId: string;
    message: string;
  }): Promise<AccessRequest> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/access-requests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // return await response.json();

      await new Promise(resolve => setTimeout(resolve, 200));
      
      const newRequest: AccessRequest = {
        id: `req${Date.now()}`,
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      tempAccessRequests.push(newRequest);

      // Also create a notification
      const notification: NotificationItem = {
        id: `notif${Date.now()}`,
        type: 'access_request',
        title: 'New Access Request',
        message: `${data.researcherName} wants to access ${data.farmName}`,
        fromUserId: data.researcherId,
        fromUserName: data.researcherName,
        relatedEntityId: newRequest.id,
        read: false,
        createdAt: new Date().toISOString(),
        actionRequired: true,
        actionData: { requestId: newRequest.id }
      };

      tempNotifications.push(notification);
      return newRequest;
    } catch (error) {
      console.error('Error sending access request:', error);
      throw error;
    }
  }

  // Respond to access request
  static async respondToAccessRequest(
    requestId: string, 
    response: 'accepted' | 'rejected',
    farmOwnerId: string
  ): Promise<AccessRequest> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/access-requests/${requestId}/respond`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ response, farmOwnerId })
      // });
      // return await response.json();

      await new Promise(resolve => setTimeout(resolve, 200));
      
      const requestIndex = tempAccessRequests.findIndex(req => req.id === requestId);
      if (requestIndex === -1) {
        throw new Error('Request not found');
      }

      const request = tempAccessRequests[requestIndex];
      tempAccessRequests[requestIndex] = {
        ...request,
        status: response,
        respondedAt: new Date().toISOString()
      };

      // Create notification for researcher
      const notification: NotificationItem = {
        id: `notif${Date.now()}`,
        type: response === 'accepted' ? 'access_granted' : 'access_denied',
        title: response === 'accepted' ? 'Access Granted' : 'Access Denied',
        message: `Your request to access ${request.farmName} has been ${response}`,
        fromUserId: farmOwnerId,
        relatedEntityId: request.farmId,
        read: false,
        createdAt: new Date().toISOString(),
        actionRequired: false
      };

      tempNotifications.push(notification);
      return tempAccessRequests[requestIndex];
    } catch (error) {
      console.error('Error responding to access request:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/notifications/${notificationId}/read`, {
      //   method: 'PUT'
      // });
      // return response.ok;

      await new Promise(resolve => setTimeout(resolve, 100));
      
      const notificationIndex = tempNotifications.findIndex(notif => notif.id === notificationId);
      if (notificationIndex !== -1) {
        tempNotifications[notificationIndex].read = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/notifications/${userId}/read-all`, {
      //   method: 'PUT'
      // });
      // return response.ok;

      await new Promise(resolve => setTimeout(resolve, 100));
      
      tempNotifications.forEach(notif => {
        if (notif.fromUserId !== userId) {
          notif.read = true;
        }
      });
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/notifications/${userId}/unread-count`);
      // const data = await response.json();
      // return data.count;

      await new Promise(resolve => setTimeout(resolve, 50));
      return tempNotifications.filter(notif => 
        !notif.read && notif.fromUserId !== userId
      ).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

export default NotificationsService;
