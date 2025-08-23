import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { SectionWrapper } from '../components/SectionWrapper';
import { PointCard } from '../components/PointCard';
import { ButtonGrid } from '../components/ButtonGrid';
import { Partnership } from '../components/Partnership';
import { CompletedEvent } from '../components/CompletedEvent';
import { AppbarHomepage } from '../components/AppbarHomepage';
import { FAB } from '../components/FAB';
import BottomNav from '../components/BottomNav';
import './Dashboard.css';

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

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleEventHistoryClick = () => {
    console.log('Event History clicked');
    // TODO: Navigate to event history page
  };

  const handleTransactionClick = () => {
    console.log('Transaction clicked');
    // TODO: Navigate to transaction page
  };

  const handleRedeemClick = () => {
    console.log('Redeem clicked');
    // TODO: Navigate to redeem page
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
        <PointCard points={5000} />
        
        <ButtonGrid 
          onProfileClick={handleProfileClick}
          onEventHistoryClick={handleEventHistoryClick}
          onTransactionClick={handleTransactionClick}
          onRedeemClick={handleRedeemClick}
        />
        
        <SectionWrapper title="Partnership">
          <Partnership />
        </SectionWrapper>
        
        <SectionWrapper title="Completed Event">
          <CompletedEvent />
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
