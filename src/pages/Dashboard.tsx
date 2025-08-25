import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { SectionWrapper } from '../components/SectionWrapper';
import { PointCard } from '../components/PointCard';
import { ButtonGrid } from '../components/ButtonGrid';
import { Partnership } from '../components/Partnership';
import { CompletedEvent } from '../components/CompletedEvent';
import { UpcomingNews } from '../components/UpcomingNews';
import { AppbarHomepage } from '../components/AppbarHomepage';
import { FAB } from '../components/FAB';
import BottomNav from '../components/BottomNav';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    console.log('Notification clicked!');
    // Navigation is handled in AppbarHomepage component
  };

  const handleFABClick = () => {
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    navigate('/login');
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

  const handleCartClick = () => {
    console.log('Cart clicked');
    // TODO: Navigate to cart page
  };

  return (
    <div className="dashboard-page">
      <AppbarHomepage 
        avatar="/vite.svg" 
        name="User" 
        notificationCount={unreadCount}
        onNotificationClick={handleNotificationClick}
        cartCount={3}
        onCartClick={handleCartClick}
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
        
        <SectionWrapper title="Upcoming News">
          <UpcomingNews />
        </SectionWrapper>
      </div>
      <FAB 
        onClick={handleFABClick} 
        ariaLabel="Notifications" 
      />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
