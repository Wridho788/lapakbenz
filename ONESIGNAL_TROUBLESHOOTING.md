# OneSignal Troubleshooting Guide

## ✅ Perubahan yang Sudah Dilakukan

### 1. Updated `src/main.tsx`
- ✅ Added detailed console logging
- ✅ Added service worker path configuration
- ✅ Added permission checking before showing slidedown
- ✅ Added subscription change listener
- ✅ Added notification click handler
- ✅ Better error handling

### 2. Updated `vite.config.ts`
- ✅ Removed OneSignal workers from PWA inclusion
- ✅ Added workbox deny list for OneSignal paths
- ✅ Added runtime caching for OneSignal CDN

### 3. Created Debug Page
- ✅ New route: `/onesignal-debug`
- ✅ Shows real-time OneSignal status
- ✅ Shows permission, subscription, tokens
- ✅ Action buttons to test functionality

---

## 🔍 Cara Diagnosa Masalah

### Step 1: Akses Debug Page

1. Jalankan aplikasi:
   ```bash
   pnpm dev
   ```

2. Buka browser di: **http://localhost:5173/onesignal-debug**

3. Lihat status OneSignal:
   - **Initialized**: Harus `✅ Yes`
   - **Permission**: Harus `granted` (jika sudah allow)
   - **Subscribed**: Harus `✅ Yes`
   - **Push Token**: Harus ada token string
   - **OneSignal ID**: Harus ada ID

### Step 2: Check Browser Console

Buka browser console (F12) dan cari log messages:
```
🔔 Initializing OneSignal...
✅ OneSignal initialized successfully
🔐 Notification permission: default/granted/denied
📢 Showing slidedown prompt... (jika belum granted)
✅ User already subscribed (jika sudah granted)
📱 Push subscription status: true/false
```

### Step 3: Check Service Worker

1. Buka Chrome DevTools → Application tab
2. Klik "Service Workers"
3. Harus ada service worker dengan scope `/onesignal/`
4. Status harus "activated and running"

---

## 🐛 Common Issues & Solutions

### Issue 1: "Initialized: ❌ No"

**Kemungkinan penyebab:**
- OneSignal SDK belum ter-load
- App ID salah
- Network issue

**Solusi:**
1. Check console untuk error messages
2. Pastikan `e97b9d55-bdde-4fa9-8b00-b5d8c72cd466` adalah App ID yang benar
3. Clear browser cache dan reload
4. Check network tab untuk failed requests ke OneSignal

### Issue 2: "Permission: denied"

**Penyebab:** User memblock notifikasi

**Solusi:**
1. User harus unblock manual dari browser settings:
   - **Chrome**: Settings → Privacy → Site Settings → Notifications
   - **Firefox**: Options → Privacy → Permissions → Notifications
   - Atau klik icon 🔒 di address bar → Notifications → Allow

2. Setelah unblock, klik "Request Permission" di debug page

### Issue 3: "Permission: default" tapi tidak muncul prompt

**Kemungkinan penyebab:**
- Slidedown prompt di-block
- Browser tidak support push notifications
- Running di localhost dengan HTTPS issue

**Solusi:**
1. Coba klik "Request Permission" manual dari debug page
2. Check console untuk error messages
3. Pastikan `allowLocalhostAsSecureOrigin: true` di config
4. Restart browser

### Issue 4: "Subscribed: ❌ No" padahal Permission granted

**Kemungkinan penyebab:**
- Subscription belum selesai
- Service worker issue

**Solusi:**
1. Klik "Subscribe" button di debug page
2. Clear service workers:
   - DevTools → Application → Service Workers
   - Klik "Unregister" untuk semua workers
   - Reload page
3. Restart browser

### Issue 5: Notifikasi tidak muncul padahal Subscribed

**Kemungkinan penyebab:**
- Browser notifications di-disable di OS level
- Focus Assist / Do Not Disturb mode aktif
- Chrome notification settings issue

**Solusi:**

**Windows:**
1. Settings → System → Notifications
2. Pastikan "Get notifications from apps and senders" = ON
3. Check browser ada di list dan ON

**Mac:**
1. System Preferences → Notifications
2. Cari browser (Chrome/Firefox)
3. Pastikan notifications enabled

**Chrome specific:**
1. chrome://settings/content/notifications
2. Pastikan site Anda di "Allowed" list
3. Coba remove dan add again

### Issue 6: Service Worker conflict

**Gejala:** Multiple service workers terdeteksi

**Solusi:**
1. Unregister semua service workers
2. Clear browser data (cache, cookies)
3. Restart browser
4. Reload aplikasi

---

## 🧪 Testing Checklist

### 1. Permission Test
- [ ] Slidedown prompt muncul untuk first-time user
- [ ] Browser native permission prompt muncul
- [ ] Allow notification berhasil (permission = granted)
- [ ] Bell button muncul di pojok kanan bawah

### 2. Subscription Test  
- [ ] Subscribed status = Yes setelah allow
- [ ] Push Token ter-generate
- [ ] OneSignal ID ter-generate
- [ ] User muncul di OneSignal Dashboard → Audience

### 3. Notification Test
- [ ] Kirim test dari OneSignal Dashboard
- [ ] Notifikasi muncul di OS notification center
- [ ] Klik notifikasi membuka URL yang benar
- [ ] Notification sound terdengar (jika tidak di silent mode)

### 4. Browser Console Test
- [ ] Tidak ada error messages
- [ ] Semua log messages muncul dengan benar
- [ ] No 404 errors untuk service worker files

---

## 🚀 Step-by-Step Testing Process

### Test 1: Fresh Install (Clear State)

```bash
# 1. Clear all data
# Chrome: DevTools → Application → Clear Storage → Clear site data

# 2. Reload page
# 3. Buka /onesignal-debug
# 4. Check status:
#    - Initialized: Yes
#    - Permission: default
#    - Subscribed: No

# 5. Klik "Request Permission"
# 6. Allow di browser prompt
# 7. Refresh debug page
# 8. Check status:
#    - Permission: granted
#    - Subscribed: Yes
#    - Push Token: ada
#    - OneSignal ID: ada
```

### Test 2: Send Notification from Dashboard

```bash
# 1. Login OneSignal Dashboard
# 2. Messages → New Push
# 3. Title: "Test Notification"
# 4. Message: "This is a test"
# 5. Audience: "Send to All Subscribers"
# 6. Send immediately
# 7. Wait 5-10 seconds
# 8. Notification harus muncul
```

### Test 3: Target Specific User

```bash
# 1. Copy OneSignal ID dari /onesignal-debug
# 2. OneSignal Dashboard → Messages → New Push
# 3. Audience: "Send to Particular Users"
# 4. Paste OneSignal ID
# 5. Send notification
# 6. Notification harus muncul
```

---

## 📊 Expected Debug Page Output (Working State)

```
OneSignal Status
├─ Initialized: ✅ Yes
├─ Permission: granted
├─ Subscribed: ✅ Yes
├─ Push Token: c8f5d7... (long string)
├─ OneSignal ID: 12345678-abcd-1234-... (UUID)
├─ External User ID: None (atau user_id jika login)
└─ Push Supported: ✅ Yes

Service Workers
└─ Scope: http://localhost:5173/onesignal/
   ├─ Active: activated
   └─ Waiting: none
```

---

## 🔧 Advanced Debugging

### Check OneSignal Dashboard

1. **Audience → All Users**
   - User Anda harus muncul di list
   - Status: "Subscribed"
   - Last Seen: baru-baru ini

2. **Messages → View Messages**
   - Check delivery status
   - "Successful" = delivered
   - "Failed" = ada masalah

3. **Settings → Keys & IDs**
   - Pastikan App ID match dengan config
   - Check Safari Web ID jika test di Safari

### Network Tab Debugging

1. Open DevTools → Network tab
2. Reload page
3. Filter by "onesignal"
4. Check requests:
   - `https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js` → 200 OK
   - `https://[your-app].onesignal.com/...` → 200 OK
5. Check for 404 or 500 errors

### Service Worker Debugging

1. DevTools → Application → Service Workers
2. Check "Update on reload"
3. Klik "Unregister" dan reload
4. Verify new service worker installs
5. Check Console tab untuk service worker messages

---

## 📱 Platform-Specific Issues

### Chrome/Edge (Chromium)
- Pastikan browser notifications enabled
- Check chrome://flags untuk experimental features yang di-disable
- Clear Site Settings jika stuck

### Firefox
- about:preferences#privacy → Permissions → Notifications
- Pastikan tidak ada extension yang block notifications
- Check about:serviceworkers untuk registered workers

### Safari (macOS/iOS)
- Perlu Safari Web ID (optional parameter)
- iOS requires Add to Home Screen untuk push notifications
- macOS: Check System Preferences → Notifications

### Mobile Browsers
- **Android Chrome**: Works normally
- **iOS Safari**: Requires PWA install (Add to Home Screen)
- **iOS Chrome/Firefox**: Uses Safari WebKit, sama seperti iOS Safari

---

## 🆘 Still Not Working?

### Final Checklist:
1. [ ] App ID benar: `e97b9d55-bdde-4fa9-8b00-b5d8c72cd466`
2. [ ] OneSignal SDK ter-load (check network tab)
3. [ ] Service worker terdaftar dan active
4. [ ] Browser permission = granted
5. [ ] OS-level notifications enabled
6. [ ] Not in Do Not Disturb / Focus Assist mode
7. [ ] OneSignal Dashboard shows user as subscribed
8. [ ] Test notification sent successfully (check Dashboard)
9. [ ] No console errors
10. [ ] Debug page shows all green checkmarks

### Get Help:
- Check console logs dan screenshoot
- Copy debug page data (raw JSON)
- Check OneSignal Dashboard delivery logs
- Share error messages untuk further diagnosis
