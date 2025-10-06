import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useAuthStore } from '../stores/authStore';
import { useSplash, useSlider, useLedger, useDecodeToken, usePostArticle, useProfile, useCart } from '../api/hooks/index';
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
  const { refetch: cartRefetch } = useCart();
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

  // API hooks for cart
    const {
      data: apiCartData,
    } = useCart();
  
  // State untuk development mode dan notification testing
  const [showDevTools, setShowDevTools] = useState(false);
  
  // Pull to refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const pullRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const PULL_THRESHOLD = 80;
  const MAX_PULL_DISTANCE = 120;
  
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
  const { data: splashData, isLoading: splashLoading, error: splashError, refetch: splashRefetch } = useSplash();
  
  // Panggil useDecodeToken hook untuk mendapatkan nama user
  const { data: decodeTokenData, error: decodeTokenError } = useDecodeToken();
  const { data: profileData, error: profileError, refetch: profileRefetch } = useProfile();
  
  // Helper function to capitalize name
  const capitalizeName = (name: string) => {
    if (!name) return 'User';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Get user image with priority: profile image_url > decodeToken image > default
  const userImage = profileData?.content?.result.image_url || '/lapakbenz.png';
  
  // Panggil useSlider hook untuk Partnership
  const { data: sliderData, refetch: sliderRefetch } = useSlider();
  
  // Panggil useLedger hook - now uses Zustand auth store internally
  const { data: ledgerData, isLoading: ledgerLoading, error: ledgerError, refetch: ledgerRefetch } = useLedger();

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

  // Pull to refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || startY.current === null || isRefreshing) return;
    
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0 && window.scrollY === 0) {
      e.preventDefault();
      // Apply resistance effect for more natural feel
      const resistance = Math.max(0.3, 1 - (diff / 300));
      const distance = Math.min(diff * resistance, MAX_PULL_DISTANCE);
      setPullDistance(distance);
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > PULL_THRESHOLD && !isRefreshing) {
      triggerRefresh();
    }
    pulling.current = false;
    startY.current = null;
    setTimeout(() => setPullDistance(0), 200);
  }, [pullDistance, isRefreshing]);

  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log('🔄 Pull to refresh triggered');

    try {
      // Refresh all data sources in parallel
      const refreshPromises = [];
      
      // Refresh slider data
      if (sliderRefetch) refreshPromises.push(sliderRefetch());
      
      // Refresh ledger data
      if (ledgerRefetch) refreshPromises.push(ledgerRefetch());
      
      // Refresh profile data
      if (profileRefetch) refreshPromises.push(profileRefetch());
      
      // Refresh splash data
      if (splashRefetch) refreshPromises.push(splashRefetch());
      
      // Refresh upcoming news
      refreshPromises.push(upcomingNewsMutation.mutateAsync({}));
      
      // Refresh cart data
      if (cartRefetch) refreshPromises.push(cartRefetch());
      
      // Wait for all refreshes to complete
      await Promise.allSettled(refreshPromises);
      
      console.log('✅ Pull to refresh completed');
    } catch (error) {
      console.error('❌ Pull to refresh error:', error);
    } finally {
      // Add a small delay to show the refresh animation
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  }, [isRefreshing, sliderRefetch, ledgerRefetch, profileRefetch, splashRefetch, upcomingNewsMutation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pulling.current = false;
      startY.current = null;
      setPullDistance(0);
    };
  }, []);

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
      localStorage.removeItem('authToken');
      return;
    }

     // Log profile data
  if (profileData) {
    console.log('✅ Profile API Response:', profileData);
    console.log('🖼️ User Image URL:', profileData.content?.result?.image_url);
  }
  if (profileError) {
    console.error('❌ Profile API Error:', profileError);
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
  }, [authToken, ledgerData, ledgerError, ledgerLoading, isAuthenticated, updatePoints, logout, navigate, decodeTokenData, decodeTokenError, profileData, profileError]);

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

  // Log cart API data
    useEffect(() => {
      if (apiCartData) {
        console.log('🛒 Cart API Response:', apiCartData);
        console.log('🛒 Cart Items:', apiCartData?.content?.result);
        console.log('🛒 Cart Balance:', apiCartData?.content?.balance);
        console.log('🛒 Cart Record Count:', apiCartData?.content?.record);
      }
    }, [apiCartData]);

    const getApiCartCount = () => {
    return apiCartData?.content?.result?.reduce((total, item) => total + item.qty, 0) || 0;
  };
    const apiCartCount = getApiCartCount();

  // Handler untuk menutup splash screen
  const handleCloseSplash = () => {
    setShowSplash(false);
  };

  const handleNotificationClick = () => {
       navigate('/notifications');
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

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <>
    <AppbarHomepage 
        avatar={userImage}
        name={decodeTokenError ? "User" : capitalizeName(decodeTokenData?.content?.name || "User")} 
        notificationCount={unreadCount}
        onNotificationClick={handleNotificationClick}
        cartCount={apiCartCount}
        onCartClick={handleCartClick}
      />
    <div 
      className="dashboard-page"
      ref={pullRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: pulling.current ? 'none' : 'transform 0.2s ease-out'
      }}
    >
      {/* Pull to Refresh Indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          style={{
            position: 'fixed',
            top: pullDistance > 0 ? `${Math.max(0, pullDistance - 60)}px` : '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '8px 16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#666',
            transition: 'all 0.2s ease-out'
          }}
        >
          <div 
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid #ddd',
              borderTop: '2px solid #007bff',
              borderRadius: '50%',
              animation: isRefreshing ? 'spin 1s linear infinite' : 
                       pullDistance > PULL_THRESHOLD ? 'spin 1s linear infinite' : 'none',
              transform: !isRefreshing && pullDistance <= PULL_THRESHOLD ? 
                        `rotate(${(pullDistance / PULL_THRESHOLD) * 360}deg)` : 'none'
            }}
          />
          {isRefreshing ? 'Refreshing...' : 
           pullDistance > PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      )}
      
      {/* Splash Screen */}
      {showSplash && splashImage && (
        <SplashScreen 
          imageUrl={splashImage} 
          onClose={handleCloseSplash} 
        />
      )}
      
      
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
        />
        
        {/* Conditionally render Partnership section */}
        {shouldShowPartnership && (
          <SectionWrapper title="Partnership">
            <Partnership />
          </SectionWrapper>
        )}

        {/* Conditionally render CompletedEvent section */}
        <SectionWrapper title="Upcoming Events">
          <CompletedEvent />
        </SectionWrapper>

        {/* Conditionally render UpcomingNews section */}
        {shouldShowUpcomingNews && (
          <SectionWrapper title="Latest News">
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
    </>
  );
};

export default Dashboard;
