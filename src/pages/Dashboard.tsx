import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useCart } from '../contexts/CartContext';
import { useAuthStore } from '../stores/authStore';
import { useSplash, useSlider, useLedger, useDecodeToken, usePostArticle } from '../api/hooks';
import { SectionWrapper } from '../components/SectionWrapper';
import { PointCard } from '../components/PointCard';
import { ButtonGrid } from '../components/ButtonGrid';
import { Partnership } from '../components/Partnership';
import { CompletedEvent } from '../components/CompletedEvent';
import { UpcomingNews } from '../components/UpcomingNews';
import { AppbarHomepage } from '../components/AppbarHomepage';
import { FAB } from '../components/FAB';
import BottomNav from '../components/BottomNav';
import SplashScreen from '../components/SplashScreen';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { unreadCount } = useNotificationContext();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  
  // Use Zustand auth store
  const { 
    token: authToken, 
    user, 
    isAuthenticated, 
    requireAuth: storeRequireAuth,
    updatePoints,
    logout
  } = useAuthStore();
  
  // State untuk development mode dan notification testing
  const [showDevTools, setShowDevTools] = useState(false);
  
  // Development helper function untuk testing
  const setTestToken = () => {
    const testToken = 'test-valid-token-12345';
    // Use auth store instead of localStorage
    useAuthStore.getState().login(testToken, { username: 'test-user' });
    console.log('🧪 Test token set:', testToken);
  };
  
  const clearToken = () => {
    logout();
    console.log('🗑️ Token cleared');
  };
  
  // Add to window for debugging (development only)
  if (typeof window !== 'undefined') {
    (window as any).setTestToken = setTestToken;
    (window as any).clearToken = clearToken;
    (window as any).toggleDevTools = () => setShowDevTools(prev => !prev);
  }
  
  // Helper function untuk check authentication using Zustand store
  const requireAuth = (callback: () => void, actionName: string = 'access this feature') => {
    const success = storeRequireAuth(() => {
      callback();
    }, actionName);
    
    if (!success) {
      navigate('/login');
    }
    
    return success;
  };
  
  // State untuk splash screen - Tokopedia-like behavior (show once per session)
  const [showSplash, setShowSplash] = useState(false);
  const [splashImage, setSplashImage] = useState<string>('');
  const [hasShownSplash, setHasShownSplash] = useState(() => {
    // Check if splash has been shown in current session
    return sessionStorage.getItem('splashShown') === 'true';
  });
  
  // Get current user points from auth store
  const userPoints = user?.points || 0;
  
  // Panggil useSplash hook
  const { data: splashData, isLoading: splashLoading, error: splashError } = useSplash();
  
  // Panggil useDecodeToken hook untuk mendapatkan nama user
  const { data: decodeTokenData, error: decodeTokenError } = useDecodeToken();
  
  // Panggil useSlider hook untuk Partnership
  const { data: sliderData } = useSlider();
  
  // Panggil useLedger hook - now uses Zustand auth store internally
  const { data: ledgerData, isLoading: ledgerLoading, error: ledgerError } = useLedger();

  // Panggil usePostArticle untuk check upcoming news
  const upcomingNewsMutation = usePostArticle();

 

  // Check if Partnership should be displayed
  const shouldShowPartnership = sliderData?.content?.result && 
                               Array.isArray(sliderData.content.result) && 
                               sliderData.content.result.length > 0;

 
  // Check if UpcomingNews should be displayed
  const shouldShowUpcomingNews = upcomingNewsMutation.data?.content?.result && 
                               Array.isArray(upcomingNewsMutation.data.content.result) && 
                               upcomingNewsMutation.data.content.result.length > 0;

 

  // Trigger upcoming news API call
  useEffect(() => {
    upcomingNewsMutation.mutate({});
  }, []);

  // Log ledger response and update points in Zustand store
  useEffect(() => {
    console.log('🔍 Auth Token Status:', { 
      authToken: authToken ? authToken.substring(0, 10) + '...' : null, 
      hasToken: !!authToken,
      isAuthenticated 
    });
    
    // Log decode token data
    if (decodeTokenData) {
      console.log('✅ Decode Token API Response:', decodeTokenData);
    }
    if (decodeTokenError) {
      console.error('❌ Decode Token API Error:', decodeTokenError);
    }
    
    if (ledgerData) {
      console.log('✅ Ledger API Response:', ledgerData);
      
      // Check if response indicates invalid token
      if (ledgerData.error && ledgerData.error.includes('Invalid Token')) {
        console.log('❌ Token is invalid or expired, logging out');
        logout();
        navigate('/login');
        return;
      }
      
      // Extract points dari ledger response
      if (ledgerData.content) {
        // API returns points directly in content.point
        const points = ledgerData.content.point || 0;
        updatePoints(points);
        console.log('💰 User Points from API:', points);
        console.log('📊 Additional ledger info:', {
          userId: ledgerData.content.userid,
          balance: ledgerData.content.balance,
          record: ledgerData.content.record
        });
      } else {
        // Jika tidak ada content, set points ke 0
        updatePoints(0);
        console.log('⚠️ No ledger content available, points set to 0');
      }
    }
    
    if (ledgerError) {
      console.error('❌ Ledger API Error:', ledgerError);
      updatePoints(0); // Set points ke 0 jika ada error
    }
    
    if (ledgerLoading) {
      console.log('⏳ Ledger API Loading...');
    }
  }, [authToken, ledgerData, ledgerError, ledgerLoading, isAuthenticated, updatePoints, logout, navigate, decodeTokenData, decodeTokenError]);

  // Log response ke console dan handle splash screen Tokopedia-style
  useEffect(() => {
    if (splashData) {
      console.log('Splash API Response:', splashData);
      
      // Extract image dari response
      if (splashData.content && splashData.content.result && splashData.content.result.length > 0) {
        const firstSlide = splashData.content.result[0];
        if (firstSlide.image && !hasShownSplash) {
          setSplashImage(firstSlide.image);
          setShowSplash(true);
          
          // Mark splash as shown in session storage
          sessionStorage.setItem('splashShown', 'true');
          setHasShownSplash(true);
          
          // Auto close setelah 5 detik
          const timer = setTimeout(() => {
            setShowSplash(false);
          }, 5000);
          
          return () => clearTimeout(timer);
        }
      }
    }
    if (splashError) {
      console.error('Splash API Error:', splashError);
    }
    if (splashLoading) {
      console.log('Splash API Loading...');
    }
  }, [splashData, splashError, splashLoading, hasShownSplash]);

  // Handler untuk menutup splash screen
  const handleCloseSplash = () => {
    setShowSplash(false);
  };

  const handleNotificationClick = () => {
    console.log('Notification clicked!');
    // Navigation is handled in AppbarHomepage component
  };

  const handleFABClick = () => {
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    requireAuth(() => navigate('/profile'), 'access profile');
  };

  const handleEventHistoryClick = () => {
    requireAuth(() => navigate('/profile/event-history'), 'view event history');
  };

  const handleTransactionClick = () => {
    requireAuth(() => navigate('/orders'), 'view transaction history');
  };

  const handleRedeemClick = () => {
    requireAuth(() => navigate('/profile/redeem-history'), 'view redeem history');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <div className="dashboard-page">
      {/* Splash Screen */}
      {showSplash && splashImage && (
        <SplashScreen 
          imageUrl={splashImage} 
          onClose={handleCloseSplash} 
        />
      )}
      
      <AppbarHomepage 
        avatar="/merci.png" 
        name={decodeTokenData?.content?.name || user?.username || "User"} 
        notificationCount={unreadCount}
        onNotificationClick={handleNotificationClick}
        cartCount={cartCount}
        onCartClick={handleCartClick}
      />
      <div className="dashboard-content">
        {/* Development Tools - Only shown when enabled */}
        {showDevTools && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#f0f0f0', 
            border: '1px solid #ccc', 
            borderRadius: '8px',
            margin: '1rem 0'
          }}>
            <h3>🧪 Notification API Debug</h3>
            <p>Auth Token: {authToken ? authToken.substring(0, 20) + '...' : 'Not set'}</p>
            <p>Unread Count: {unreadCount}</p>
            <p>Check browser console for API request/response logs</p>
            <div style={{ marginTop: '10px' }}>
              <strong>Expected API Response Structure:</strong>
              <pre style={{ fontSize: '11px', backgroundColor: '#fff', padding: '5px', borderRadius: '3px' }}>
{`{
  "content": [
    {
      "id": "832",
      "subject": "Title here",
      "content": "Message here", 
      "reading": "0", // 0=unread, 1=read
      "type": "wa",
      "created": "30 October 2024 00:14:32"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        )}
        
        <PointCard points={userPoints} />
        
        <ButtonGrid 
          onProfileClick={handleProfileClick}
          onEventHistoryClick={handleEventHistoryClick}
          onTransactionClick={handleTransactionClick}
          onRedeemClick={handleRedeemClick}
        />
        {/* Conditionally render Partnership section */}
        {shouldShowPartnership && (
          <SectionWrapper title="Partnership">
            <Partnership />
          </SectionWrapper>
        )}
        
        {/* Conditionally render CompletedEvent section */}
          <SectionWrapper title="Upcoming Event">
            <CompletedEvent />
          </SectionWrapper>
        
        {/* Conditionally render UpcomingNews section */}
        {shouldShowUpcomingNews && (
          <SectionWrapper title="Upcoming News">
            <UpcomingNews />
          </SectionWrapper>
        )}
      </div>
      <FAB 
        onClick={handleFABClick} 
        ariaLabel="Notifications" 
      />
      <BottomNav />
    </div>
  );
};

export default Dashboard;
