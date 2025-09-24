import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdNotifications, MdShoppingCart } from 'react-icons/md';
import { useCart } from '../contexts/CartContext';
import './AppbarHomepage.css';

export type AppbarHomepageProps = {
  avatar: string;
  name: string;
  onNotificationClick?: () => void;
  notificationCount?: number;
  onCartClick?: () => void;
  cartCount?: number;
};

export const AppbarHomepage: React.FC<AppbarHomepageProps> = ({ 
  avatar, 
  name, 
  onNotificationClick,
  notificationCount = 0,
  onCartClick,
  cartCount: propCartCount = 0
}) => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  
  // Use cart count from context if not provided as prop
  const displayCartCount = propCartCount || cartCount;

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
    navigate('/notifications');
  };

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      navigate('/cart');
    }
  };

  return (
    <header className="appbar-homepage">
      <div className="appbar-user-info">
        <img src={avatar} alt="avatar" className="appbar-avatar" />
        <span className="appbar-name">Hi, {name} !</span>
      </div>
      <div className="appbar-actions">
        <button
          className={`appbar-cart-btn ${displayCartCount > 0 ? 'has-items' : ''}`}
          onClick={handleCartClick}
          aria-label={`Shopping Cart (${displayCartCount})`}
          title={`You have ${displayCartCount} item${displayCartCount !== 1 ? 's' : ''} in cart`}
        >
          <MdShoppingCart />
          {displayCartCount > 0 && (
            <span className="cart-badge">
              {displayCartCount > 99 ? '99+' : displayCartCount}
            </span>
          )}
        </button>
        <button
          className={`appbar-notif-btn ${notificationCount > 0 ? 'has-notification' : ''}`}
          onClick={handleNotificationClick}
          aria-label={`Notifications (${notificationCount})`}
          title={`You have ${notificationCount} notification${notificationCount !== 1 ? 's' : ''}`}
        >
          <MdNotifications />
          {notificationCount > 0 && (
            <span className="notification-badge">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
