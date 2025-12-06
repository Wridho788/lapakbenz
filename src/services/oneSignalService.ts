/**
 * OneSignal Service untuk mengirim push notifications
 * 
 * Setup:
 * 1. Ambil REST API Key dari OneSignal Dashboard → Settings → Keys & IDs
 * 2. Ganti YOUR_REST_API_KEY dengan key yang sebenarnya
 */

const ONESIGNAL_APP_ID = 'e97b9d55-bdde-4fa9-8b00-b5d8c72cd466';
const ONESIGNAL_REST_API_KEY = 'os_v2_app_5f5z2vn53zh2tcyawxmmolgumy3alns2wt7u5qm72yo4mqe3h544e7ik7s7fh5pthvipzdeizxxgm7oqhpptcvvhxuqeyiwa4sd6j2i'; // ⚠️ GANTI INI dengan REST API Key dari dashboard

interface NotificationPayload {
  app_id: string;
  headings: { en: string };
  contents: { en: string };
  url?: string;
  data?: Record<string, any>;
  included_segments?: string[];
  include_external_user_ids?: string[];
  include_player_ids?: string[];
}

/**
 * Kirim notifikasi ke SEMUA user yang sudah subscribe
 */
export async function sendNotificationToAll(
  title: string, 
  message: string, 
  url?: string,
  data?: Record<string, any>
) {
  const payload: NotificationPayload = {
    app_id: ONESIGNAL_APP_ID,
    included_segments: ['All'], // Kirim ke semua subscriber
    headings: { en: title },
    contents: { en: message },
  };

  if (url) payload.url = url;
  if (data) payload.data = data;

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OneSignal API Error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Kirim notifikasi ke user tertentu berdasarkan External User ID (user_id dari database)
 */
export async function sendNotificationToUser(
  userId: string,
  title: string, 
  message: string,
  url?: string,
  data?: Record<string, any>
) {
  const payload: NotificationPayload = {
    app_id: ONESIGNAL_APP_ID,
    include_external_user_ids: [userId], // Target user spesifik
    headings: { en: title },
    contents: { en: message },
  };

  if (url) payload.url = url;
  if (data) payload.data = data;

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OneSignal API Error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Kirim notifikasi ke multiple users berdasarkan External User IDs
 */
export async function sendNotificationToUsers(
  userIds: string[],
  title: string, 
  message: string,
  url?: string,
  data?: Record<string, any>
) {
  const payload: NotificationPayload = {
    app_id: ONESIGNAL_APP_ID,
    include_external_user_ids: userIds,
    headings: { en: title },
    contents: { en: message },
  };

  if (url) payload.url = url;
  if (data) payload.data = data;

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OneSignal API Error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Kirim notifikasi berdasarkan segment (misalnya: chapter tertentu)
 */
export async function sendNotificationToSegment(
  segmentName: string,
  title: string, 
  message: string,
  url?: string,
  data?: Record<string, any>
) {
  const payload: NotificationPayload = {
    app_id: ONESIGNAL_APP_ID,
    included_segments: [segmentName],
    headings: { en: title },
    contents: { en: message },
  };

  if (url) payload.url = url;
  if (data) payload.data = data;

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OneSignal API Error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// ============ EXAMPLE USAGE ============

/**
 * Contoh: Kirim notifikasi event baru ke semua user
 */
export async function notifyNewEvent(eventName: string, eventId: string) {
  return sendNotificationToAll(
    'Event Baru! 🎉',
    `${eventName} sudah tersedia. Daftar sekarang!`,
    `https://lapakbenz.com/event/${eventId}`,
    { type: 'event', event_id: eventId }
  );
}

/**
 * Contoh: Kirim notifikasi order ke user tertentu
 */
export async function notifyOrderStatus(userId: string, orderId: string, status: string) {
  const statusMessages: Record<string, string> = {
    'confirmed': '✅ Pesanan Anda telah dikonfirmasi',
    'shipped': '📦 Pesanan Anda sedang dikirim',
    'delivered': '🎉 Pesanan Anda telah sampai',
    'cancelled': '❌ Pesanan Anda dibatalkan'
  };

  return sendNotificationToUser(
    userId,
    'Update Pesanan',
    statusMessages[status] || 'Status pesanan Anda berubah',
    `https://lapakbenz.com/order/${orderId}`,
    { type: 'order', order_id: orderId, status }
  );
}

/**
 * Contoh: Kirim reminder event ke pendaftar
 */
export async function notifyEventReminder(userIds: string[], eventName: string, eventDate: string) {
  return sendNotificationToUsers(
    userIds,
    'Reminder Event 📅',
    `${eventName} akan dimulai pada ${eventDate}`,
    'https://lapakbenz.com/event',
    { type: 'reminder' }
  );
}
