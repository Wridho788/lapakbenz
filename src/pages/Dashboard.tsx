import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { useCart } from '../contexts/CartContext';
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
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    console.log('Notification clicked!');
    // Navigation is handled in AppbarHomepage component
  };

  const handleFABClick = () => {
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleEventHistoryClick = () => {
    console.log('Event History clicked');
    navigate('/profile/event-history');
  };

  const handleTransactionClick = () => {
    console.log('Transaction clicked');
    navigate('/profile/transaction-history');
  };

  const handleRedeemClick = () => {
    console.log('Redeem clicked');
    navigate('/profile/redeem-history');
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
    navigate('/cart');
  };

  return (
    <div className="dashboard-page">
      <AppbarHomepage 
        avatar="/vite.svg" 
        name="User" 
        notificationCount={unreadCount}
        onNotificationClick={handleNotificationClick}
        cartCount={cartCount}
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
