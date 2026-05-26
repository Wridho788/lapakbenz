// Notification types

export interface NotificationPayload {
  category?: string;
  limit?: string;
  offset?: string;
  type?: string;
  campaign?: string;
  read?: string;
  [key: string]: any;
}

export interface NotificationItem {
  id: string;
  subject: string;
  content: string;
  reading: string;
  campaign: string;
  type: string;
  created: string;
  [key: string]: any;
}

export interface NotificationResponse {
  success?: boolean;
  message?: string;
  result?: {
    content?: NotificationItem[];
  };
}

export interface NotificationDetailResponse {
  success?: boolean;
  message?: string;
  content?: {
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    [key: string]: any;
  };
}
