import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMessage, MdKeyboardArrowRight } from 'react-icons/md';
import { toast } from 'react-toastify';
import { AppbarDefault } from '../components/AppbarDefault';
import { useNotifications, useNotificationDetail } from '../api/hooks/index';
import { useAuthStore } from '../stores/authStore';
import type { NotificationItem } from '../contexts/NotificationContext';
import './Notifications.css';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuthStore();
  
  // Use the notifications hook instead of context
  const { 
    data: notificationsData, 
    isLoading, 
    error, 
    refetch 
  } = useNotifications();
  console.log('Notifications data:', notificationsData);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const pullRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const PULL_THRESHOLD = 60;

  // Setup non-passive touch event listeners for pull-to-refresh
  useEffect(() => {
    const element = pullRef.current;
    if (!element) return;

    // Scroll to top on mount
    window.scrollTo(0, 0);

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !isLoading && !refreshing) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling.current || startY.current === null) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 0) {
        e.preventDefault();
        setPullDistance(Math.min(diff, 120));
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > PULL_THRESHOLD) {
        triggerRefresh();
      }
      pulling.current = false;
      startY.current = null;
      setTimeout(() => setPullDistance(0), 150);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isLoading, refreshing, pullDistance]);

  // Get notification detail when needed
  const { 
    data: notificationDetail, 
    isLoading: isDetailLoading 
  } = useNotificationDetail(
    selectedNotificationId || '', 
    undefined
  );

  const normalizeNotificationResult = (data: any): any[] => {
    if (!data) {
      return [];
    }

    if (Array.isArray(data.result)) {
      return data.result;
    }

    if (data.result?.content && Array.isArray(data.result.content)) {
      return data.result.content;
    }

    return [];
  };

  // Process notifications data
  const notifications: NotificationItem[] = React.useMemo(() => {
    const content = normalizeNotificationResult(notificationsData);
    console.log('Processing notifications content:', notificationsData);

    if (!content.length) {
      return [];
    }

    return content.map((item: any) => ({
      id: item.id?.toString() || '',
      title: item.subject || item.content || 'No Subject',
      message: item.content || item.subject || 'No Content',
      timestamp: item.created ? new Date(item.created) : new Date(),
      reading: item.reading === 1 || item.reading === '1' ? '1' : '0',
      type: item.type?.toString() || 'general',
    }));
  }, [notificationsData]);

  const unreadCount = React.useMemo(() => {
    return notifications.filter(n => n.reading === "0").length;
  }, [notifications]);

  const triggerRefresh = useCallback(async () => {
    if (refreshing || isLoading) return;
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  }, [refetch, refreshing, isLoading]);


  const formatDateTime = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
  };

  const markAsRead = useCallback(async () => {
    // This would typically call an API to mark as read
    // For now, we'll trigger a refetch to update the data
    await refetch();
  }, [refetch]);

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!isAuthenticated || !token) {
      toast.warning('Silakan masuk untuk melihat detail notifikasi', {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      return;
    }

    setSelectedNotificationId(notification.id);

    // Wait for detail data to load (with timeout)
    const maxWait = 3000;
    const startTime = Date.now();
    while (isDetailLoading && Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const detailContent = notificationDetail?.content || notificationDetail?.result || notificationDetail;
    const displayTitle = detailContent?.subject || detailContent?.content || notification.title;

    toast.info(
      <div style={{ textAlign: 'left' }}>
        <strong style={{ display: 'block', marginBottom: '8px', fontSize: '16px' }}>
          {displayTitle}
        </strong>
      </div>,
      {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
        closeOnClick: true,
      }
    );

    if (notification.reading === "0") {
      await markAsRead();
    }

    setSelectedNotificationId(null);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return (
    <div
      className="notifications-page force-light-theme"
      ref={pullRef}
      style={{
        overscrollBehavior: 'contain'
      }}
    >
       <AppbarDefault 
        title={`Notifications (${unreadCount})`} 
        onBack={() => navigate(-1)}
        showCart={false}
        defaultBack="/dashboard" 
      />

      <div style={{
        height: pullDistance > 0 ? pullDistance : 0,
        transition: pulling.current ? 'none' : 'height 0.2s ease',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#555'
      }}>
        {pullDistance > 0 && (
          (pullDistance > PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh') + 
          (refreshing ? ' • refreshing...' : '')
        )}
      </div>

      {(isLoading || refreshing) && (
        <div className="loading-state">
          <p>{refreshing ? 'Refreshing...' : 'Loading notifications...'}</p>
        </div>
      )}

      {error && (() => {
        // If error message appears, navigate to /login
        setTimeout(() => {
          navigate('/login');
        }, 0);
        return (
          <div className="error-state">
            <p>Error loading notifications: {error.message}</p>
          </div>
        );
      })()}

      {!isLoading && !error && (
        <div className="notifications-list">
          {notifications.map((notification: NotificationItem) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.reading === "1" ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                <MdMessage />
              </div>
              
              <div className="notification-content">
                <h3 className="notification-title">{notification.title}</h3>
                <p className="notification-message">{notification.message}</p>
                <p className="notification-datetime">
                  {formatDateTime(notification.timestamp)}
                </p>
              </div>
              
              <div className="notification-arrow">
                <MdKeyboardArrowRight />
              </div>
          </div>
          ))}
        </div>
      )}

      {!isLoading && !error && notifications.length === 0 && (
        <div className="empty-state">
          <MdMessage className="empty-icon" />
          <h3>Tidak Ada Notifikasi</h3>
          <p>Anda belum memiliki notifikasi apapun.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;