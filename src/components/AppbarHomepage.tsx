import React from 'react';
import { FiBell } from 'react-icons/fi';
import './AppbarHomepage.css';

export type AppbarHomepageProps = {
  avatar: string;
  name: string;
  onNotificationClick?: () => void;
  hasNotification?: boolean;
};

export const AppbarHomepage: React.FC<AppbarHomepageProps> = ({ 
  avatar, 
  name, 
  onNotificationClick,
  hasNotification = false 
}) => (
  <header className="appbar-homepage">
    <div className="appbar-user-info">
      <img src={avatar} alt="avatar" className="appbar-avatar" />
      <span className="appbar-name">{name}</span>
    </div>
    <button
      className={`appbar-notif-btn ${hasNotification ? 'has-notification' : ''}`}
      onClick={onNotificationClick}
      aria-label="Notifications"
      title="Notifications"
    >
      <FiBell />
    </button>
  </header>
);
