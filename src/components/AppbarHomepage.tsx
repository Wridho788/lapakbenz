import React from 'react';

export type AppbarHomepageProps = {
  avatar: string;
  name: string;
  onNotificationClick?: () => void;
};

export const AppbarHomepage: React.FC<AppbarHomepageProps> = ({ avatar, name, onNotificationClick }) => (
  <header className="appbar-homepage">
    <img src={avatar} alt="avatar" className="appbar-avatar" />
    <span className="appbar-name">{name}</span>
    <button className="appbar-notif-btn" onClick={onNotificationClick}>
      🔔
    </button>
  </header>
);
