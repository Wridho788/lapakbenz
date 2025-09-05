import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMessage, MdKeyboardArrowRight } from 'react-icons/md';
import Swal from 'sweetalert2';
import { useNotificationContext } from '../contexts/NotificationContext';
import { useCart } from '../contexts/CartContext';
// import BottomNav from '../components/BottomNav';
import { AppbarDefault } from '../components/AppbarDefault';
import type { NotificationItem } from '../contexts/NotificationContext';
import './Notifications.css';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, isLoading, error, refetch } = useNotificationContext();
  const [refreshing, setRefreshing] = useState(false);
  const pullRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const PULL_THRESHOLD = 60;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
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
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  }, [refetch, refreshing]);
  const { cartCount } = useCart();

  const handleCartClick = () => {
    navigate('/cart');
  };

  const formatDateTime = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    // Don't mark as read immediately, wait for user to close alert
    // Fetch detail via API on demand using raw fetch to utilize new body (keep lightweight here)
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const detailPayload = { type: '', campaign: '', read: '0', limit: '2', offset: '0' };
        const res = await fetch(`${import.meta.env.VITE_API_BASE || 'https://mbapi.dswip.com/'}${'customer/notif_detail/'}${notification.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-auth-token': token },
          body: JSON.stringify(detailPayload)
        });
        const json = await res.json();
        const detail = json?.content || {};
        const result = await Swal.fire({
          title: detail.subject || notification.title,
            text: detail.content || notification.message,
          icon: 'info',
          confirmButtonText: 'Close',
          confirmButtonColor: '#161129',
          customClass: {
            popup: 'notification-alert',
            title: 'notification-alert-title',
            htmlContainer: 'notification-alert-content'
          }
        });
        
        // Mark as read when user closes the alert
        if (result.isConfirmed && !notification.isRead) {
          markAsRead(notification.id);
        }
      }
    } catch (err) {
      console.error('Detail fetch error', err);
      const result = await Swal.fire({
        title: notification.title,
        text: notification.message,
        icon: 'info',
        confirmButtonText: 'Close',
        confirmButtonColor: '#161129'
      });
      
      // Mark as read when user closes the alert (fallback case)
      if (result.isConfirmed && !notification.isRead) {
        markAsRead(notification.id);
      }
    }
  };

  return (
    <div 
      className="notifications-page" 
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
        onCartClick={handleCartClick}
        cartCount={cartCount}
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
        {(pullDistance > PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh') + (refreshing ? ' • refreshing...' : '')}
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
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
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
