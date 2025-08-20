import React from 'react';
import './Badge.css';

export type BadgeProps = {
  type?: 'notif' | 'point';
  children: React.ReactNode;
};

export const Badge: React.FC<BadgeProps> = ({ type = 'notif', children }) => (
  <span className={`badge badge-${type}`}>{children}</span>
);
