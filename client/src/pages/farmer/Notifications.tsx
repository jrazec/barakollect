import PageContainer from '../../components/PageContainer';
import PageHeaderWithFilter from '@/components/PageHeaderWithFilter';
import EmptyStateNotice from '@/components/EmptyStateNotice';
import type { NotifAttributes } from '@/interfaces/global';
import NotifComponent from '@/components/NotifComponent';
import { BellIcon } from 'lucide-react';


const FarmerBeansGallery: React.FC = () => {
    //test contenttt
    const notifCard: NotifAttributes[] = [
        {
            id: '1',
            title: 'New Bean Sample Uploaded',
            message: 'A new bean sample has been uploaded for validation.',
            timestamp: new Date().toISOString(),
            read: false,
            type: 'info',
        },
        {
            id: '2',
            title: 'Validation Complete',
            message: 'Your bean sample has been successfully validated.',
            timestamp: new Date().toISOString(),
            read: true,
            type: 'info',
        },
        {
            id: '3',
            title: 'System Maintenance Scheduled',
            message: 'The system will undergo maintenance on Saturday, 10 AM - 12 PM.',
            timestamp: new Date().toISOString(),
            read: false,
            type: 'warning',
        },
        {
            id: '4',
            title: 'New Feature Available',
            message: 'Check out the new analytics dashboard for better insights.',
            timestamp: new Date().toISOString(),
            read: true,
            type: 'info',
        },
        {
            id: '5',
            title: 'Error in Bean Submission',
            message: 'There was an error processing your last bean submission. Please try again.',
            timestamp: new Date().toISOString(),
            read: false,
            type: 'error',
        },
    ];

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
