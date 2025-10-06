import React from 'react';
import { useLocation } from 'react-router-dom';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Pages that don't need the main layout structure
  const noLayoutPages = ['/notifications', '/event'];
  const shouldUseLayout = !noLayoutPages.includes(location.pathname);
  
  // If it's a no-layout page, return children directly
  if (!shouldUseLayout) {
    return <>{children}</>;
  }
  return (
    <div className="main-layout">
      <main>{children}</main>
    </div>
  );
};

export default MainLayout;
