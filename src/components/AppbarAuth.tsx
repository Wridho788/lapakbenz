import React from 'react';
import { MdArrowBack } from 'react-icons/md';
import './AppbarAuth.css';

export type AppbarAuthProps = {
  title: string;
  onBack?: () => void;
};

export const AppbarAuth: React.FC<AppbarAuthProps> = ({ title, onBack }) => {
  return (
    <header className="appbar-auth">
      {onBack && (
        <button
          className="appbar-back-btn"
          onClick={onBack}
          aria-label="Back"
          title="Go back"
        >
          <MdArrowBack />
        </button>
      )}
      <span className="appbar-title">{title}</span>
    </header>
  );
};
