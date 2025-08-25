import React from 'react';
import './FAB.css';

export type FABProps = {
  onClick?: () => void;
  ariaLabel?: string;
};

export const FAB: React.FC<FABProps> = ({ 
  onClick, 
  ariaLabel = "Notifications" 
}) => {
  return (
    <button
      className="fab"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <img 
        src="/notification.png" 
        alt="Notification" 
        className="fab-icon"
      />
    </button>
  );
};
