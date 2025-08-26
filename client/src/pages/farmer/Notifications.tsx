import PageContainer from '../../components/PageContainer';
import PageHeaderWithFilter from '@/components/PageHeaderWithFilter';
import EmptyStateNotice from '@/components/EmptyStateNotice';
import type { NotifAttributes } from '@/interfaces/global';
import NotifComponent from '@/components/NotifComponent';
import { BellIcon } from 'lucide-react';
import { useEffect, useState } from 'react';


const FarmerBeansGallery: React.FC = () => {
    //test contenttt
   
    const [notifs, setNotifs] = useState<NotifAttributes[]>([]);


    const getNotifications = async (): Promise<NotifAttributes[]> => {
        const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/notifications/get-list/`);
        if (!response.ok) {
            throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        return data.map((notif: any) => ({
            id: notif.id,
            title: notif.title || 'Notification',
            message: notif.message,
            timestamp: notif.created_at,
            read: notif.is_read || false,
            type: notif.type || 'info', // Defaulting to 'info', adjust as necessary
        }));   
    }
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const notifications = await getNotifications();
                setNotifs(notifications);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        fetchNotifications();
    }, []);


    const notifCard: NotifAttributes[] = notifs

    //test if no notifs, "no notifications" should show here
    // const notifCard: NotifAttributes[] = []
    
  return (
    <PageContainer>
      <div className="w-full max-w-6xl bg-[var(--mocha-beige)] rounded-xl shadow p-6">

        {/* Header */}
        <PageHeaderWithFilter
          title="Notifications"
          subtitle=""
          filterOptions={['All', 'Unread', 'Read']}
        />
        
        {/* notifCard */}
        <div className='bg-white rounded-lg shadow p-4'>
            <div className="w-full border border-gray-300 p-3 box-border bg-gray-50 max-h-[400px] overflow-y-auto">
            {notifCard.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {notifCard.map(notif => {
                        return <NotifComponent item={notif} />;
                    })}
                </div>
            ) : (
                <EmptyStateNotice icon={<BellIcon />} message="No Notifications." />
            )}
        </div>
        </div>

      </div>
    </PageContainer>
  );
};

export default FarmerBeansGallery;
