import React from 'react';

export type SectionWrapperProps = {
  title: string;
  children: React.ReactNode;
};

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, children }) => (
  <div>
    <h3>{title}</h3>
    <div>{children}</div>
  </div>
);
