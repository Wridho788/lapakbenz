import React from 'react';
import { useLocation } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/event':
        return 'Events';
      case '/profile':
        return 'Profile';
      default:
        return 'Page';
    }
  };

  return (
    <div className="main-layout relative mx-auto max-w-[430px] min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">{children}</main>
    </div>
  );
};

export default MainLayout;
