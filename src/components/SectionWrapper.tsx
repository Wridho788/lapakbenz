import React from 'react';

export type SectionWrapperProps = {
  title: string;
  children: React.ReactNode;
};

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, children }) => (
  <div>
    <h2>{title}</h2>
    <div>{children}</div>
  </div>
);
