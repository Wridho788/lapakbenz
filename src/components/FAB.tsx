import React from 'react';

export type FABProps = {
  icon: React.ReactNode;
  onClick?: () => void;
};

export const FAB: React.FC<FABProps> = ({ icon, onClick }) => (
  <button className="fab" onClick={onClick}>
    {icon}
  </button>
);
