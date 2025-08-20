import React from 'react';

export type AppbarDefaultProps = {
  title: string;
  onBack?: () => void;
};

export const AppbarDefault: React.FC<AppbarDefaultProps> = ({ title, onBack }) => (
  <header className="appbar-default">
    <button className="appbar-back-btn" onClick={onBack}>
      ←
    </button>
    <span className="appbar-title">{title}</span>
  </header>
);
