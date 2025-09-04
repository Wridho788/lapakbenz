import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useCart } from '../contexts/CartContext';
import { useSplash, useSlider, useLedger } from '../api/hooks';
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
  
  // State untuk development mode dan notification testing
  const [showDevTools, setShowDevTools] = useState(false);
  
  // Development helper function untuk testing
  const setTestToken = () => {
    const testToken = 'test-valid-token-12345';
    localStorage.setItem('authToken', testToken);
    setAuthToken(testToken);
    console.log('🧪 Test token set:', testToken);
  };
  
  const clearToken = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUserPoints(0);
    setTokenStatus('missing');
    console.log('🗑️ Token cleared');
  };
  
  // Add to window for debugging (development only)
  if (typeof window !== 'undefined') {
    (window as any).setTestToken = setTestToken;
    (window as any).clearToken = clearToken;
    (window as any).toggleDevTools = () => setShowDevTools(prev => !prev);
  }
  
  // Helper function untuk check authentication
  const requireAuth = (callback: () => void, actionName: string = 'access this feature') => {
    if (!authToken || tokenStatus === 'invalid' || tokenStatus === 'missing') {
      console.log(`🔒 Authentication required to ${actionName}, redirecting to login`);
      navigate('/login');
      return false;
    }
    if (tokenStatus === 'loading') {
      console.log(`⏳ Token still loading, please wait...`);
      return false;
    }
    callback();
    return true;
  };
  
  // State untuk splash screen
  const [showSplash, setShowSplash] = useState(false);
  const [splashImage, setSplashImage] = useState<string>('');
  const [userPoints, setUserPoints] = useState<number>(0);
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'invalid' | 'missing'>('loading');
  
  // Get auth token from localStorage dengan state untuk reactivity
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  // Initialize auth token
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    setAuthToken(token);
    
    if (!token) {
      setTokenStatus('missing');
      setUserPoints(0);
      console.log('🔑 No auth token found in localStorage');
    } else {
      setTokenStatus('loading');
      console.log('🔑 Auth token found:', token.substring(0, 10) + '...');
      if (userId) {
        console.log('👤 User ID from login:', userId);
      }
    }
  }, []);
  
  // Panggil useSplash hook
  const { data: splashData, isLoading: splashLoading, error: splashError } = useSplash();
  
  // Panggil useSlider hook untuk Partnership
  const { data: sliderData } = useSlider();
  
  // Panggil useLedger hook dengan auth token - hanya jika token valid
  const { data: ledgerData, isLoading: ledgerLoading, error: ledgerError } = useLedger(authToken);

  // Check if Partnership should be displayed
  const shouldShowPartnership = sliderData?.content?.result && 
                               Array.isArray(sliderData.content.result) && 
                               sliderData.content.result.length > 0;

  // Log ledger response ke console
  useEffect(() => {
    console.log('🔍 Auth Token Status:', { 
      authToken: authToken ? authToken.substring(0, 10) + '...' : null, 
      hasToken: !!authToken,
      tokenStatus 
    });
    
    if (ledgerData) {
      console.log('✅ Ledger API Response:', ledgerData);
      
      // Check if response indicates invalid token
      if (ledgerData.error && ledgerData.error.includes('Invalid Token')) {
        setTokenStatus('invalid');
        setUserPoints(0);
        console.log('❌ Token is invalid or expired');
        return;
      }
      
      // Extract points dari ledger response
      if (ledgerData.content) {
        // API returns points directly in content.point
        const points = ledgerData.content.point || 0;
        setUserPoints(points);
        setTokenStatus('valid');
        console.log('💰 User Points from API:', points);
        console.log('📊 Additional ledger info:', {
          userId: ledgerData.content.userid,
          balance: ledgerData.content.balance,
          record: ledgerData.content.record
        });
      } else {
        // Jika tidak ada content, set points ke 0
        setUserPoints(0);
        setTokenStatus('invalid');
        console.log('⚠️ No ledger content available, points set to 0');
      }
    }
    
    if (ledgerError) {
      console.error('❌ Ledger API Error:', ledgerError);
      setTokenStatus('invalid');
      setUserPoints(0); // Set points ke 0 jika ada error
    }
    
    if (ledgerLoading) {
      console.log('⏳ Ledger API Loading...');
      if (authToken) {
        setTokenStatus('loading');
      }
    }
  }, [authToken, ledgerData, ledgerError, ledgerLoading, tokenStatus]);

  // Log response ke console
  useEffect(() => {
    if (splashData) {
      console.log('Splash API Response:', splashData);
      
      // Extract image dari response
      if (splashData.content && splashData.content.result && splashData.content.result.length > 0) {
        const firstSlide = splashData.content.result[0];
        if (firstSlide.image) {
          setSplashImage(firstSlide.image);
          setShowSplash(true);
          
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
  }, [splashData, splashError, splashLoading]);

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
    requireAuth(() => navigate('/profile/transaction-history'), 'view transaction history');
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
        avatar="/vite.svg" 
        name="User" 
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
        
        <SectionWrapper title="Completed Event">
          <CompletedEvent />
        </SectionWrapper>
        
        <SectionWrapper title="Upcoming News">
          <UpcomingNews />
        </SectionWrapper>
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
