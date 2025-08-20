import React from 'react';

export type SectionWrapperProps = {
  title: string;
  children: React.ReactNode;
};

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, children }) => (
  <section className="section-wrapper">
    <h2 className="section-title">{title}</h2>
    <div className="section-content">{children}</div>
  </section>
);
