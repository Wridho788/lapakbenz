import React from 'react';
import './Card.css';

export type CardProps = {
  type?: 'event' | 'news' | 'generic';
  children: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({ type = 'generic', children }) => (
  <div className={`card card-${type}`}>{children}</div>
);
