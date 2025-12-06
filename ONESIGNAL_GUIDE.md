# OneSignal Integration Guide - lapakBenz

## Setup yang Sudah Dilakukan ✅

### 1. Installation
```bash
pnpm install react-onesignal
```

### 2. Configuration Files

#### `src/main.tsx`
- OneSignal diinisialisasi saat app start
- App ID: `e97b9d55-bdde-4fa9-8b00-b5d8c72cd466`
- Notify button enabled (bell icon di pojok kanan bawah)
- Slidedown prompt untuk request permission

#### `src/pages/Login.tsx`
- Set External User ID setelah login berhasil
- Menggunakan `userData.id` sebagai identifier
- Memungkinkan targeting notifikasi ke user tertentu

#### `src/services/oneSignalService.ts`
- Service untuk mengirim push notifications
- Multiple functions untuk berbagai use case

---

## Cara Mengirim Notifikasi

### A. Dari OneSignal Dashboard (Manual)

1. Login ke https://app.onesignal.com
2. Pilih app Anda (e97b9d55-bdde-4fa9-8b00-b5d8c72cd466)
3. Klik **"Messages"** → **"New Push"**
4. Isi form:
   - **Title**: Judul notifikasi
   - **Message**: Isi pesan
   - **Launch URL** (optional): URL tujuan saat notif diklik
   - **Audience**: 
     - "Send to All Subscribers" = semua user
     - "Send to Particular Segment" = grup tertentu
     - "Send to Particular Users" = user spesifik (by External User ID)
5. Klik **"Send Message"**

---

### B. Menggunakan REST API (Backend)

#### 1. Setup REST API Key

1. Buka OneSignal Dashboard → **Settings** → **Keys & IDs**
2. Copy **REST API Key**
3. Buka `src/services/oneSignalService.ts`
4. Ganti `YOUR_REST_API_KEY` dengan key yang sebenarnya:
   ```typescript
   const ONESIGNAL_REST_API_KEY = 'Your-Actual-Key-Here';
   ```

#### 2. Import Service
```typescript
import { 
  sendNotificationToAll,
  sendNotificationToUser,
  sendNotificationToUsers,
  notifyNewEvent,
  notifyOrderStatus
} from '@/services/oneSignalService';
```

#### 3. Contoh Penggunaan

##### a) Kirim ke Semua User
```typescript
// Notifikasi event baru
await sendNotificationToAll(
  'Event Baru! 🎉',
  'Go Tourism Fest 2025 sudah dibuka!',
  'https://lapakbenz.com/event/17',
  { type: 'event', event_id: '17' }
);

// Notifikasi produk baru
await sendNotificationToAll(
  'Produk Baru',
  'Velg Racing terbaru sudah tersedia',
  'https://lapakbenz.com/product/100'
);
```

##### b) Kirim ke User Tertentu
```typescript
// Notifikasi order
await sendNotificationToUser(
  '12345', // user_id dari database
  'Pesanan Dikonfirmasi ✅',
  'Pesanan #ORD001 telah dikonfirmasi',
  'https://lapakbenz.com/order/ORD001',
  { type: 'order', order_id: 'ORD001' }
);

// Atau gunakan helper function
await notifyOrderStatus('12345', 'ORD001', 'confirmed');
```

##### c) Kirim ke Multiple Users
```typescript
// Reminder event untuk pendaftar
const registeredUserIds = ['123', '456', '789'];
await sendNotificationToUsers(
  registeredUserIds,
  'Reminder Event 📅',
  'Go Tourism Fest dimulai besok!',
  'https://lapakbenz.com/event/17'
);
```

---

### C. Integrasi dengan Backend/API

#### Contoh: Kirim notifikasi saat event baru dibuat

```typescript
// Di component EventManagement atau Admin Panel
import { notifyNewEvent } from '@/services/oneSignalService';

const handleCreateEvent = async (eventData) => {
  try {
    // 1. Create event di database
    const response = await createEventAPI(eventData);
    
    // 2. Kirim push notification
    await notifyNewEvent(
      eventData.name,
      response.data.id
    );
    
    toast.success('Event created and notification sent!');
  } catch (error) {
    console.error('Failed to create event:', error);
  }
};
```

#### Contoh: Update status order dengan notifikasi

```typescript
// Di order management
import { notifyOrderStatus } from '@/services/oneSignalService';

const handleUpdateOrderStatus = async (orderId, userId, newStatus) => {
  try {
    // 1. Update order status di database
    await updateOrderStatusAPI(orderId, newStatus);
    
    // 2. Kirim notifikasi ke user
    await notifyOrderStatus(userId, orderId, newStatus);
    
    toast.success('Order updated and user notified');
  } catch (error) {
    console.error('Failed to update order:', error);
  }
};
```

---

## Testing

### 1. Test di Local Development

1. Jalankan dev server:
   ```bash
   pnpm dev
   ```

2. Buka browser di http://localhost:5173

3. Bell icon akan muncul di pojok kanan bawah

4. Klik bell dan allow notifications

5. Test kirim notifikasi dari Dashboard OneSignal

### 2. Test di Production

1. Deploy ke Vercel

2. Buka https://merciku-sandy.vercel.app

3. Allow notifications saat prompt muncul

4. User akan otomatis subscribe

5. Kirim test notification dari Dashboard

---

## User Flow

### 1. First Visit (Guest)
```
User visit → Slidedown prompt → Allow/Block
                                   ↓
                            Subscribe to OneSignal
```

### 2. Login
```
Login success → Set External User ID (userData.id)
                        ↓
        OneSignal.login(userId)
                        ↓
        User dapat menerima targeted notifications
```

### 3. Receiving Notifications
```
Backend/Dashboard kirim notif → OneSignal servers
                                       ↓
                            Browser push notification
                                       ↓
                            User klik notification
                                       ↓
                            Navigate to specified URL
```

---

## Advanced Features

### 1. Segmentation (User Groups)

Buat segment di OneSignal Dashboard untuk targeting yang lebih spesifik:
- Chapter Jakarta
- Chapter Bandung
- Premium Members
- Event Participants

Contoh kirim ke segment:
```typescript
await sendNotificationToSegment(
  'Jakarta', // segment name
  'Event Jakarta 🌆',
  'Event spesial untuk chapter Jakarta!',
  'https://lapakbenz.com/event'
);
```

### 2. Tags (User Properties)

Set tags untuk user:
```typescript
// Di component setelah login
import OneSignal from 'react-onesignal';

// Set user tags
await OneSignal.User.addTags({
  chapter: 'Jakarta',
  member_type: 'premium',
  interests: 'automotive,events'
});
```

### 3. Data Payloads

Kirim custom data dengan notifikasi:
```typescript
await sendNotificationToUser(
  userId,
  'New Message',
  'You have a new message',
  'https://lapakbenz.com/messages',
  {
    type: 'message',
    sender_id: '789',
    conversation_id: 'conv123',
    // custom data lainnya
  }
);
```

Handle di frontend:
```typescript
// Di main.tsx atau App.tsx
OneSignal.Notifications.addEventListener('click', (event) => {
  const data = event.notification.additionalData;
  
  if (data?.type === 'message') {
    navigate(`/messages/${data.conversation_id}`);
  } else if (data?.type === 'order') {
    navigate(`/order/${data.order_id}`);
  }
});
```

---

## Troubleshooting

### Notifikasi tidak muncul?
1. Cek browser console untuk errors
2. Pastikan user sudah allow notifications
3. Cek OneSignal Dashboard → Delivery → View Messages
4. Pastikan REST API Key sudah di-set dengan benar

### External User ID tidak ke-set?
1. Cek console log saat login
2. Pastikan `userData.id` ada dan valid
3. Cek di OneSignal Dashboard → Audience → All Users

### CORS Error?
1. OneSignal API harus dipanggil dari backend, bukan frontend
2. Atau gunakan OneSignal Dashboard untuk kirim manual

---

## Security Notes

⚠️ **PENTING:**
- REST API Key harus disimpan di **BACKEND/SERVER** saja
- **JANGAN** commit REST API Key ke Git
- Gunakan environment variables untuk production
- Frontend hanya perlu App ID (sudah di main.tsx)

---

## Next Steps

1. ✅ Setup sudah selesai di frontend
2. ⏳ Ambil REST API Key dari Dashboard
3. ⏳ Update `oneSignalService.ts` dengan key yang benar
4. ⏳ Integrate dengan backend API untuk auto-send notifications
5. ⏳ Test kirim notifikasi dari Dashboard
6. ⏳ Deploy dan test di production

---

## Documentation Links

- OneSignal Docs: https://documentation.onesignal.com/
- REST API Reference: https://documentation.onesignal.com/reference/create-notification
- React SDK: https://github.com/OneSignal/react-onesignal
