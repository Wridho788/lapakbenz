import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdNotifications, MdShoppingCart, MdPerson } from 'react-icons/md';
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
  cartCount = 0
}) => {
  const navigate = useNavigate();
  const [avatarError, setAvatarError] = useState(false);

  const handleAvatarError = () => setAvatarError(true);
  const handleAvatarLoad = () => setAvatarError(false);

  const showDefaultIcon = avatarError || !avatar;

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
      navigate('/cart', { state: { from: '/dashboard' } });
    }
  };

  return (
    <header className="appbar-homepage">
      <div className="appbar-user-info">
        {showDefaultIcon ? (
          <div className="appbar-avatar-placeholder">
            <MdPerson size={20} />
          </div>
        ) : (
          <img
            src={avatar}
            alt="avatar"
            className="appbar-avatar"
            onError={handleAvatarError}
            onLoad={handleAvatarLoad}
          />
        )}
        <span className="appbar-name">Hi, {name || 'User'} !</span>
      </div>
      <div className="appbar-actions">
        <button
          className={`appbar-cart-btn ${cartCount > 0 ? 'has-items' : ''}`}
          onClick={handleCartClick}
          aria-label={`Shopping Cart (${cartCount})`}
          title={`You have ${cartCount} item${cartCount !== 1 ? 's' : ''} in cart`}
        >
          <MdShoppingCart />
          {cartCount > 0 && (
            <span className="cart-badge">
              {cartCount > 99 ? '99+' : cartCount}
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
