import React from 'react';
import './Button.css';

export type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'icon';
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, onClick, icon }) => (
  <button className={`btn btn-${variant}`} onClick={onClick}>
    {icon && <span className="btn-icon">{icon}</span>}
    {children}
  </button>
);
