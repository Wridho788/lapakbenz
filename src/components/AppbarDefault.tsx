import React from 'react';
import { MdArrowBack } from 'react-icons/md';
import './AppbarDefault.css';

export type AppbarDefaultProps = {
  title: string;
  onBack?: () => void;
};

export const AppbarDefault: React.FC<AppbarDefaultProps> = ({ title, onBack }) => (
  <header className="appbar-default">
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
