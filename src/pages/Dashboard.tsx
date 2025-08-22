import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { SectionWrapper } from '../components/SectionWrapper';
import { AppbarHomepage } from '../components/AppbarHomepage';
import { FAB } from '../components/FAB';
import BottomNav from '../components/BottomNav';

const Dashboard: React.FC = () => {
  const { unreadCount, addNotification } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    console.log('Notification clicked!');
    // Navigation is handled in AppbarHomepage component
  };

  const handleFABClick = () => {
    navigate('/notifications');
  };

  const addTestNotification = () => {
    addNotification({
      title: 'Test Notification',
      message: 'This is a test notification added from dashboard demo.',
      isRead: false
    });
  };

  return (
    <div className="dashboard-page">
      <AppbarHomepage 
        avatar="/vite.svg" 
        name="User" 
        notificationCount={unreadCount}
        onNotificationClick={handleNotificationClick}
      />
      <div className="dashboard-content">
        <SectionWrapper title="My Account">
          <div>User Info</div>
        </SectionWrapper>
        <SectionWrapper title="My Point">
          <div>100 Points</div>
        </SectionWrapper>
        <SectionWrapper title="Notification Demo">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer' }}
              onClick={addTestNotification}
            >
              Add Test Notification
            </button>
            <button 
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer' }}
              onClick={() => console.log(`Current unread: ${unreadCount}`)}
            >
              Check Count ({unreadCount})
            </button>
          </div>
        </SectionWrapper>
        <SectionWrapper title="Sections">
          <div>Section List</div>
        </SectionWrapper>
      </div>
      <FAB 
        icon={<span style={{ fontSize: '24px' }}>🔔</span>}
        onClick={handleFABClick} 
        ariaLabel="Notifications" 
      />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
