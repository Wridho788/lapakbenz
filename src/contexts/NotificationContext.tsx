import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useNotifications as useNotificationsApi, useUnreadNotifications } from '../api/hooks/index';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  reading: string; // "0" for unread, "1" for read
  timestamp: Date;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

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

// Helper function to transform API notification to local format
const transformApiNotification = (apiNotification: any): NotificationItem => {
  try {
    const readingValue = apiNotification.reading;
    const normalizedReading = readingValue === 1 || readingValue === '1' ? '1' : '0';

    return {
      id: apiNotification.id?.toString() || `api-${Date.now()}-${Math.random()}`,
      title: apiNotification.subject || apiNotification.content || 'Notification',
      message: apiNotification.content || apiNotification.subject || '',
      reading: normalizedReading,
      timestamp: apiNotification.created ? new Date(apiNotification.created) : new Date(),
    };
  } catch (error) {
    console.error('📋 Error transforming single notification:', error, apiNotification);
    return {
      id: `error-${Date.now()}`,
      title: 'Error Loading Notification',
      message: 'There was an error loading this notification.',
      reading: '0',
      timestamp: new Date(),
    };
  }
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>([]);

  // Fetch all notifications
  const { 
    data: notificationData, 
    isLoading: notificationLoading, 
    error: notificationError,
    refetch: refetchNotifications
  } = useNotificationsApi();

  // Fetch unread notifications count
  const { 
    data: unreadData, 
    isLoading: unreadLoading, 
    error: unreadError 
  } = useUnreadNotifications();

  // Log errors for debugging
  React.useEffect(() => {
    if (notificationError) {
      console.error('📋 Notification Context - All Notifications Error:', notificationError);
    }
    if (unreadError) {
      console.error('📋 Notification Context - Unread Notifications Error:', unreadError);
    }
  }, [notificationError, unreadError]);

  // Transform API data to local format with error handling
  const apiNotifications: NotificationItem[] = React.useMemo(() => {
    const content = normalizeNotificationResult(notificationData);
    if (!content.length) {
      return [];
    }

    try {
      return content.map(transformApiNotification);
    } catch (error) {
      console.error('📋 Error transforming notifications:', error);
      return [];
    }
  }, [notificationData]);

  // Combine API notifications with local ones
  const allNotifications = React.useMemo(() => {
    return [...localNotifications, ...apiNotifications];
  }, [localNotifications, apiNotifications]);

  // Calculate unread count from API data with error handling
  const apiUnreadCount = React.useMemo(() => {
    const content = normalizeNotificationResult(unreadData);
    if (!content.length) {
      return 0;
    }
    return content.filter((notification: any) => notification.reading === '0' || notification.reading === 0).length;
  }, [unreadData]);

  // Total unread count (API + local)
  const totalUnreadCount = apiUnreadCount + localNotifications.filter(n => !n.reading).length;

  const isLoading = notificationLoading || unreadLoading;
  const error = notificationError || unreadError;

  const markAsRead = (id: string) => {
    setLocalNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, reading: '1' }
          : notification
      )
    );
    // TODO: Call API to mark notification as read
  };

  const markAllAsRead = () => {
    setLocalNotifications(prev => 
      prev.map(notification => ({ ...notification, reading: '1' }))
    );
    // TODO: Call API to mark all notifications as read
  };

  const addNotification = (newNotification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const notification: NotificationItem = {
      ...newNotification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setLocalNotifications(prev => [notification, ...prev]);
  };

  const refetch = () => {
    refetchNotifications();
  };

  const value: NotificationContextType = {
    notifications: allNotifications,
    unreadCount: totalUnreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    addNotification,
    refetch
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
