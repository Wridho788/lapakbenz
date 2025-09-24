import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMessage, MdKeyboardArrowRight } from 'react-icons/md';
import Swal from 'sweetalert2';
import { AppbarDefault } from '../components/AppbarDefault';
import { useNotifications, useNotificationDetail } from '../api/hooks';
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
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const pullRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const PULL_THRESHOLD = 60;

  // Force light mode
  useEffect(() => {
    const body = document.body;
    body.classList.add('force-light-mode');
    
    return () => {
      body.classList.remove('force-light-mode');
    };
  }, []);

  // Get notification detail when needed
  const { 
    data: notificationDetail, 
    isLoading: isDetailLoading 
  } = useNotificationDetail(
    selectedNotificationId || '', 
    undefined
  );

  // Process notifications data
  const notifications: NotificationItem[] = React.useMemo(() => {
    if (!notificationsData?.content) return [];
    
    return notificationsData.content.map((item: any) => ({
      id: item.id?.toString() || '',
      title: item.subject || 'No Subject',
      message: item.content || 'No Content',
      timestamp: new Date(item.created_at || Date.now()),
      reading: item.reading === '1' ? "1" : "0",
      type: item.type || 'general'
    }));
  }, [notificationsData]);

  const unreadCount = React.useMemo(() => {
    return notifications.filter(n => n.reading === "0").length;
  }, [notifications]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !isLoading && !refreshing) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
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
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in to view notification details',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#161129',
      });
      return;
    }

    try {
      // Set the selected notification to trigger detail fetch
      setSelectedNotificationId(notification.id);

      // // Show loading state
      // const loadingSwal = Swal.fire({
      //   title: 'Loading...',
      //   text: 'Fetching notification details',
      //   allowOutsideClick: false,
      //   showConfirmButton: false,
      //   didOpen: () => {
      //     Swal.showLoading();
      //   },
      // });

      // Wait for detail to be fetched
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      const checkInterval = setInterval(async () => {
        attempts++;
        
        if (notificationDetail?.content || attempts >= maxAttempts || !isDetailLoading) {
          clearInterval(checkInterval);
          Swal.close();
          
          // Extract detail data
          const detailContent = notificationDetail?.content;
          const displayTitle = detailContent?.subject || notification.title;
          const displayContent = detailContent?.content || notification.message;
          
          // If content is HTML, we'll strip HTML tags for display
          const stripHtml = (html: string) => {
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
          };
          
          const cleanContent = displayContent.includes('<') ? stripHtml(displayContent) : displayContent;

          const result = await Swal.fire({
            title: displayTitle,
            html: `<div style="text-align: left; max-height: 400px; overflow-y: auto; line-height: 1.6;">
                     ${cleanContent.length > 500 ? 
                       `<p>${cleanContent.substring(0, 500)}...</p>
                        <p><em>Content truncated for display</em></p>` : 
                       `<p>${cleanContent}</p>`
                     }
                   </div>`,
            icon: 'info',
            confirmButtonText: 'Close',
            confirmButtonColor: '#161129',
            width: '90%',
            customClass: {
              popup: 'notification-alert',
              title: 'notification-alert-title',
              htmlContainer: 'notification-alert-content',
            },
          });

          // Mark as read when user closes the alert
          if (result.isConfirmed && notification.reading === "0") {
            await markAsRead();
          }

          // Clear selected notification
          setSelectedNotificationId(null);
        }
      }, 100);

    } catch (err) {
      console.error('Notification detail error:', err);
      Swal.close();

      // Fallback to basic notification data
      const result = await Swal.fire({
        title: notification.title,
        text: notification.message,
        icon: 'info',
        confirmButtonText: 'Close',
        confirmButtonColor: '#161129',
      });

      if (result.isConfirmed && notification.reading === "0") {
        await markAsRead();
      }

      setSelectedNotificationId(null);
    }
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        overscrollBehavior: 'contain'
      }}
    >
       <AppbarDefault 
        title={`Notifications (${unreadCount})`} 
        onBack={() => navigate(-1)}
        showCart={false}
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

      {error && (
        <div className="error-state">
          <p>Error loading notifications: {error.message}</p>
        </div>
      )}

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
          <h3>No Notifications</h3>
          <p>You don't have any notifications yet.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;