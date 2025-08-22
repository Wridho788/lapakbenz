import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdNotifications } from 'react-icons/md';
import './AppbarHomepage.css';

export type AppbarHomepageProps = {
  avatar: string;
  name: string;
  onNotificationClick?: () => void;
  notificationCount?: number;
};

export const AppbarHomepage: React.FC<AppbarHomepageProps> = ({ 
  avatar, 
  name, 
  onNotificationClick,
  notificationCount = 0
}) => {
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
    navigate('/notifications');
  };

  return (
    <header className="appbar-homepage">
      <div className="appbar-user-info">
        <img src={avatar} alt="avatar" className="appbar-avatar" />
        <span className="appbar-name">Hi, {name} !</span>
      </div>
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
    </header>
  );
};
