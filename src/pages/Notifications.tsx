import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMessage, MdKeyboardArrowRight } from 'react-icons/md';
import Swal from 'sweetalert2';
import { useNotifications } from '../contexts/NotificationContext';
// import BottomNav from '../components/BottomNav';
import { AppbarDefault } from '../components/AppbarDefault';
import type { NotificationItem } from '../contexts/NotificationContext';
import './Notifications.css';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead } = useNotifications();

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
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Show SweetAlert with notification message
    await Swal.fire({
      title: notification.title,
      text: notification.message,
      icon: 'info',
      confirmButtonText: 'Close',
      confirmButtonColor: '#161129',
      customClass: {
        popup: 'notification-alert',
        title: 'notification-alert-title',
        htmlContainer: 'notification-alert-content'
      }
    });
  };

  return (
    <div className="notifications-page">
      <AppbarDefault 
        title={`Notifications (${unreadCount})`} 
        onBack={() => navigate(-1)} 
      />

      <div className="notifications-list">
        {notifications.map((notification) => (
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

      {notifications.length === 0 && (
        <div className="empty-state">
          <MdMessage className="empty-icon" />
          <h3>No Notifications</h3>
          <p>You don't have any notifications yet.</p>
        </div>
      )}
      
      {/* <BottomNav /> */}
    </div>
  );
};

export default Notifications;
