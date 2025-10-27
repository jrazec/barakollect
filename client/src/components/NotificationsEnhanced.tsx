import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { NotificationsService } from '@/services/notificationsService';
import type { NotificationItem, AccessRequest } from '@/interfaces/global';
import PageContainer from './PageContainer';
import PageHeader from './PageHeader';
import TabComponent from '@/components/TabComponent';
import { BellIcon, SendIcon, UserIcon, CheckIcon, XIcon } from 'lucide-react';

const Notifications: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('Notifications');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<AccessRequest[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Access request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [targetFarm, setTargetFarm] = useState<{
    farmId: string;
    farmName: string;
    farmOwnerId: string;
  } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // You might want to get user role from your user management system
        // For now, we'll determine it from the route
        const role = location.pathname.includes('researcher') ? 'researcher' : 'farmer';
        setUserRole(role);
      }
    };
    getUser();
  }, [location]);

  useEffect(() => {
    // Check if we were redirected here with farm owner info for access request
    const farmOwnerId = searchParams.get('farmOwnerId');
    const farmId = searchParams.get('farmId');
    const farmName = searchParams.get('farmName');
    
    if (farmOwnerId && farmId && farmName && userRole === 'researcher') {
      setTargetFarm({ farmId, farmName, farmOwnerId });
      setActiveTab('Access Requests');
      setShowRequestForm(true);
    }
  }, [searchParams, userRole]);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, userRole, activeTab]);

  const loadData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Load notifications
      const notifs = await NotificationsService.getNotifications(userId);
      setNotifications(notifs);

      if (userRole === 'farmer') {
        // Load access requests for farmer
        const requests = await NotificationsService.getAccessRequests(userId);
        setAccessRequests(requests);
      } else if (userRole === 'researcher') {
        // Load sent requests for researcher
        const sentReqs = await NotificationsService.getResearcherRequests(userId);
        setSentRequests(sentReqs);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAccessRequest = async () => {
    if (!targetFarm || !userId || !requestMessage.trim()) return;

    try {
      await NotificationsService.sendAccessRequest({
        researcherId: userId,
        researcherName: 'Current User', // You'd get this from user data
        farmId: targetFarm.farmId,
        farmName: targetFarm.farmName,
        farmOwnerId: targetFarm.farmOwnerId,
        message: requestMessage.trim()
      });

      setRequestMessage('');
      setShowRequestForm(false);
      setTargetFarm(null);
      loadData(); // Refresh data
      alert('Access request sent successfully!');
    } catch (error) {
      console.error('Error sending access request:', error);
      alert('Failed to send access request. Please try again.');
    }
  };

  const handleRespondToRequest = async (requestId: string, response: 'accepted' | 'rejected') => {
    if (!userId) return;

    try {
      await NotificationsService.respondToAccessRequest(requestId, response, userId);
      loadData(); // Refresh data
      alert(`Request ${response} successfully!`);
    } catch (error) {
      console.error(`Error ${response} request:`, error);
      alert(`Failed to ${response} request. Please try again.`);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationsService.markAsRead(notificationId);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const renderNotifications = () => (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${
              notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-gray-900">{notification.title}</h3>
                  {!notification.read && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-2">{notification.message}</p>
                <p className="text-sm text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
                {notification.fromUserName && (
                  <p className="text-sm text-gray-600 mt-1">
                    From: {notification.fromUserName}
                  </p>
                )}
              </div>
              {!notification.read && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="ml-4 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderAccessRequests = () => {
    if (userRole === 'farmer') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Requests to Access Your Farms</h3>
          </div>
          
          {accessRequests.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No access requests</p>
            </div>
          ) : (
            accessRequests.map((request) => (
              <div key={request.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{request.researcherName}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        request.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Wants to access: <strong>{request.farmName}</strong>
                    </p>
                    <p className="text-gray-700 mb-3">{request.message}</p>
                    <p className="text-sm text-gray-500">
                      Requested: {new Date(request.createdAt).toLocaleString()}
                    </p>
                    {request.respondedAt && (
                      <p className="text-sm text-gray-500">
                        Responded: {new Date(request.respondedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleRespondToRequest(request.id, 'accepted')}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        <CheckIcon className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRespondToRequest(request.id, 'rejected')}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        <XIcon className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      );
    } else {
      // Researcher view
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Your Access Requests</h3>
            <button
              onClick={() => setShowRequestForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <SendIcon className="w-4 h-4" />
              <span>New Request</span>
            </button>
          </div>

          {sentRequests.length === 0 ? (
            <div className="text-center py-8">
              <SendIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No access requests sent</p>
            </div>
          ) : (
            sentRequests.map((request) => (
              <div key={request.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{request.farmName}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        request.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Farm owner: <strong>{request.farmOwnerId}</strong>
                    </p>
                    <p className="text-gray-700 mb-3">{request.message}</p>
                    <p className="text-sm text-gray-500">
                      Sent: {new Date(request.createdAt).toLocaleString()}
                    </p>
                    {request.respondedAt && (
                      <p className="text-sm text-gray-500">
                        Responded: {new Date(request.respondedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }
  };

  const tabs = userRole === 'researcher' 
    ? ['Notifications', 'Access Requests']
    : ['Notifications', 'Access Requests'];

  return (
    <PageContainer>
      <div className="w-full max-w-6xl bg-white rounded-xl shadow p-6">
        <PageHeader
          title="Notifications"
          subtitle={userRole === 'researcher' 
            ? "View notifications and manage farm access requests"
            : "View notifications and respond to researcher access requests"
          }
        />
        
        <TabComponent 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          tabs={tabs} 
        />

        <div className="bg-white rounded-lg shadow p-4">
          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            ) : activeTab === 'Notifications' ? (
              renderNotifications()
            ) : (
              renderAccessRequests()
            )}
          </div>
        </div>

        {/* Access Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {targetFarm ? `Request Access to ${targetFarm.farmName}` : 'Request Farm Access'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Explain why you need access to this farm's data..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleSendAccessRequest}
                    disabled={!requestMessage.trim()}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Request
                  </button>
                  <button
                    onClick={() => {
                      setShowRequestForm(false);
                      setRequestMessage('');
                      setTargetFarm(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default Notifications;
