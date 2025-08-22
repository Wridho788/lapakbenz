import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Dummy data notifications
const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Welcome to Merciku App!',
    message: 'Selamat datang di aplikasi Merciku! Nikmati berbagai fitur menarik yang telah kami siapkan untuk Anda. Jangan lupa untuk mengeksplorasi semua menu dan fitur yang tersedia.',
    isRead: false,
    timestamp: new Date('2025-08-22T10:30:00')
  },
  {
    id: '2',
    title: 'Update Profil Anda',
    message: 'Kami menyarankan Anda untuk melengkapi profil Anda agar dapat menikmati pengalaman yang lebih personal. Silakan kunjungi halaman profil untuk menambahkan foto dan informasi lainnya.',
    isRead: true,
    timestamp: new Date('2025-08-22T09:15:00')
  },
  {
    id: '3',
    title: 'Event Spesial Minggu Ini',
    message: 'Jangan lewatkan event spesial minggu ini! Dapatkan poin bonus dan hadiah menarik dengan mengikuti berbagai aktivitas yang telah kami siapkan. Event berlangsung hingga akhir minggu.',
    isRead: false,
    timestamp: new Date('2025-08-21T16:45:00')
  },
  {
    id: '4',
    title: 'Poin Anda Bertambah!',
    message: 'Selamat! Poin Anda telah bertambah 50 poin dari aktivitas terakhir. Total poin Anda saat ini adalah 150 poin. Gunakan poin untuk mendapatkan berbagai reward menarik.',
    isRead: true,
    timestamp: new Date('2025-08-21T14:20:00')
  },
  {
    id: '5',
    title: 'Maintenance Terjadwal',
    message: 'Aplikasi akan mengalami maintenance terjadwal pada tanggal 25 Agustus 2025 pukul 02:00 - 04:00 WIB. Mohon maaf atas ketidaknyamanan yang mungkin terjadi selama periode maintenance.',
    isRead: false,
    timestamp: new Date('2025-08-20T11:00:00')
  }
];

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const addNotification = (newNotification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const notification: NotificationItem = {
      ...newNotification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev]);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
