import React from 'react';
import { MdNotifications } from 'react-icons/md';
import './FAB.css';

export type FABProps = {
  icon?: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
};

export const FAB: React.FC<FABProps> = ({ 
  icon, 
  onClick, 
  ariaLabel = "Floating Action Button" 
}) => {
  // Fallback icon jika tidak ada icon yang diberikan
  const defaultIcon = (
    <span style={{ fontSize: '24px', color: 'white', lineHeight: 1 }}>
      🔔
    </span>
  );

  const displayIcon = icon || <MdNotifications style={{ fontSize: '24px', color: 'white', display: 'block' }} /> || defaultIcon;

  return (
    <button
      className="fab"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {displayIcon}
    </button>
  );
};
