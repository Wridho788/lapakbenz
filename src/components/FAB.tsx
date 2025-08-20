import React from 'react';
import './FAB.css';

export type FABProps = {
  icon: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
};

export const FAB: React.FC<FABProps> = ({ icon, onClick, ariaLabel = "Floating Action Button" }) => (
  <button
    className="fab"
    onClick={onClick}
    aria-label={ariaLabel}
    title={ariaLabel}
  >
    {icon}
  </button>
);
