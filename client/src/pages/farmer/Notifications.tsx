import PageContainer from '../../components/PageContainer';
import EmptyStateNotice from '@/components/EmptyStateNotice';
import type { NotifAttributes } from '@/interfaces/global';
import { BellIcon, CheckCheck, Plus, X, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationsService from '@/services/notificationsService';
import { supabase } from '@/lib/supabaseClient';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; message: string; type: 'info' | 'alert' | 'system' }) => void;
}

interface ClearNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  notificationCount: number;
}

const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'alert' | 'system'>('info');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && message.trim()) {
      onSubmit({ title: title.trim(), message: message.trim(), type });
      setTitle('');
      setMessage('');
      setType('info');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Send Broadcast Notification</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter notification title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'info' | 'alert' | 'system')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="info">Info (Green)</option>
              <option value="alert">Alert (Red)</option>
              <option value="system">System (Yellow)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter notification message"
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Send Broadcast
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ClearNotificationsModal: React.FC<ClearNotificationsModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  notificationCount 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-600">Clear All Notifications</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <Trash2 className="w-12 h-12 text-red-500" />
          </div>
          <p className="text-gray-700 text-center mb-2">
            Are you sure you want to clear all {notificationCount} notifications?
          </p>
          <p className="text-red-600 text-center text-sm font-medium">
            This action cannot be undone!
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

const Notifications: React.FC = () => {
    const [notifs, setNotifs] = useState<NotifAttributes[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const user = await supabase.auth.getUser();
            const currentUserId = user.data.user?.id;
            if (currentUserId) {
                setUserId(currentUserId);
                // Determine user role from URL path
                const path = window.location.pathname;
                if (path.includes('/admin/')) {
                    setUserRole('admin');
                } else if (path.includes('/researcher/')) {
                    setUserRole('researcher');
                } else if (path.includes('/farmer/')) {
                    setUserRole('farmer');
                }
            }
        };
        getUser();
    }, []);

    const getNotifications = async (userId: string): Promise<NotifAttributes[]> => {
        const response = await NotificationsService.getNotifications(userId);
        if (!response) {
            throw new Error('Failed to fetch notifications');
        }
        return response;
    }

    const fetchNotifications = async () => {
        if (!userId) return;
        
        setIsLoading(true);
        try {
            const notifications = await getNotifications(userId);
            setNotifs(notifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [userId]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await NotificationsService.markAsRead(notificationId);
            // Update local state
            setNotifs(prev => prev.map(notif => 
                notif.id === notificationId ? { ...notif, read: true } : notif
            ));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!userId) return;
        
        try {
            await NotificationsService.markAllAsRead(userId);
            // Update local state
            setNotifs(prev => prev.map(notif => ({ ...notif, read: true })));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const handleBroadcastSubmit = async (data: { title: string; message: string; type: 'info' | 'alert' | 'system' }) => {
        try {
            await NotificationsService.sendBroadcastNotification(data);
            alert('Broadcast notification sent successfully!');
            // Refresh notifications
            fetchNotifications();
        } catch (error) {
            console.error('Failed to send broadcast notification:', error);
            alert('Failed to send broadcast notification. Please try again.');
        }
    };

    const handleClearNotifications = async () => {
        if (!userId) return;
        
        try {
            await NotificationsService.clearNotifications(userId);
            // Clear local state
            setNotifs([]);
            setShowClearModal(false);
            alert('All notifications cleared successfully!');
        } catch (error) {
            console.error('Failed to clear notifications:', error);
            alert('Failed to clear notifications. Please try again.');
        }
    };

    const getNotificationStyles = (type: 'info' | 'alert' | 'system', read: boolean) => {
        const baseStyles = "transition-colors duration-200";
        
        if (read) {
            return `${baseStyles} bg-gray-50 border-gray-200 text-gray-600`;
        }
        
        switch (type) {
            case 'alert':
                return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
            case 'system':
                return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
            case 'info':
            default:
                return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
        }
    };

    const getTypeIcon = (type: 'info' | 'alert' | 'system') => {
        const baseClasses = "w-4 h-4";
        switch (type) {
            case 'alert':
                return <span className={`${baseClasses} text-red-500`}>⚠️</span>;
            case 'system':
                return <span className={`${baseClasses} text-yellow-500`}>🔧</span>;
            case 'info':
            default:
                return <span className={`${baseClasses} text-green-500`}>ℹ️</span>;
        }
    };

    const unreadCount = notifs.filter(notif => !notif.read).length;
    
  return (
    <PageContainer>
      <div className="w-full max-w-6xl bg-[var(--mocha-beige)] rounded-xl shadow p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                    {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
                </p>
            </div>
            
            <div className="flex space-x-3">
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <CheckCheck className="w-4 h-4" />
                        <span>Mark All Read</span>
                    </button>
                )}
                
                {notifs.length > 0 && (
                    <button
                        onClick={() => setShowClearModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear All</span>
                    </button>
                )}
                
                {userRole === 'admin' && (
                    <button
                        onClick={() => setShowBroadcastModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Broadcast</span>
                    </button>
                )}
            </div>
        </div>
        
        {/* Notifications */}
        <div className='bg-white rounded-lg shadow p-4'>
            <div className="w-full border border-gray-300 p-3 box-border bg-gray-50 max-h-[500px] overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-600">Loading notifications...</span>
                    </div>
                ) : notifs.length > 0 ? (
                    <div className="space-y-3">
                        {notifs.map(notif => (
                            <div
                                key={notif.id}
                                className={`p-4 rounded-lg border ${getNotificationStyles(notif.type, notif.read)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            {getTypeIcon(notif.type)}
                                            <h3 className="font-medium">{notif.title}</h3>
                                            {!notif.read && (
                                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                        <p className="mb-2">{notif.message}</p>
                                        <p className="text-sm opacity-75">
                                            {new Date(notif.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    
                                    {!notif.read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyStateNotice icon={<BellIcon />} message="No Notifications." />
                )}
            </div>
        </div>

        {/* Broadcast Modal */}
        <BroadcastModal
            isOpen={showBroadcastModal}
            onClose={() => setShowBroadcastModal(false)}
            onSubmit={handleBroadcastSubmit}
        />

        {/* Clear Notifications Modal */}
        <ClearNotificationsModal
            isOpen={showClearModal}
            onClose={() => setShowClearModal(false)}
            onConfirm={handleClearNotifications}
            notificationCount={notifs.length}
        />

      </div>
    </PageContainer>
  );
};

export default Notifications;
